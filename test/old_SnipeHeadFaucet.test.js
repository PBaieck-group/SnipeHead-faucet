const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SnipeHeadFaucet", function () {
  let owner, users;
  let shdToken, faucet;
  const TOKENS_PER_CLAIM = ethers.parseEther("5000");
  const DAILY_TOKEN_LIMIT = ethers.parseEther("250000");
  const COOLDOWN_PERIOD = 24 * 60 * 60; // 24 hours in seconds

  beforeEach(async function () {
    // Request 51 signers (1 owner + 50 users)
    [owner, ...users] = await ethers.getSigners(51);

    // Deploy the SnipeHead token
    const SnipeHead = await ethers.getContractFactory("SnipeHead");
    shdToken = await SnipeHead.deploy(owner.address);
    await shdToken.waitForDeployment();

    // Deploy the faucet
    const SnipeHeadFaucet = await ethers.getContractFactory("SnipeHeadFaucet");
    faucet = await SnipeHeadFaucet.deploy(shdToken.target);
    await faucet.waitForDeployment();

    // Mint and deposit tokens into the faucet (as owner)
    const initialDeposit = ethers.parseEther("1000000");
    await shdToken.connect(owner).approve(faucet.target, initialDeposit);
    await faucet.connect(owner).depositTokens(initialDeposit);
  });

  it("should deploy with correct initial state", async function () {
    expect(await faucet.owner()).to.equal(owner.address);
    expect(await faucet.shdToken()).to.equal(shdToken.target);
    expect(await faucet.getFaucetBalance()).to.equal(ethers.parseEther("1000000"));
    expect(await faucet.getDailyTokensRemaining()).to.equal(DAILY_TOKEN_LIMIT);
  });

  it("should allow a user to claim tokens", async function () {
    const user = users[0];
    const initialBalance = await shdToken.balanceOf(user.address);
    const claimTx = await faucet.connect(user).claimTokens();
    await claimTx.wait();

    const newBalance = await shdToken.balanceOf(user.address);
    expect(newBalance).to.equal(initialBalance + TOKENS_PER_CLAIM);
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM);
    expect(await faucet.getLastClaimTime(user.address)).to.equal(await time.latest());
    expect(await faucet.getDailyTokensRemaining()).to.equal(DAILY_TOKEN_LIMIT - TOKENS_PER_CLAIM);

    await expect(claimTx)
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user.address, TOKENS_PER_CLAIM, await time.latest());
  });

  it("should enforce cooldown period", async function () {
    const user = users[0];
    // First claim
    const firstClaimTime = await time.latest();
    await time.setNextBlockTimestamp(firstClaimTime + 1);
    const firstClaimTx = await faucet.connect(user).claimTokens();
    await firstClaimTx.wait();
    const lastClaimTime = await faucet.getLastClaimTime(user.address);
    console.log("First claim time (lastClaimTime):", lastClaimTime.toString());
    console.log("Current block timestamp:", (await time.latest()).toString());
    expect(lastClaimTime).to.be.above(0);

    // Set timestamp for second claim (should fail)
    await time.setNextBlockTimestamp(lastClaimTime + 1n);
    await expect(faucet.connect(user).claimTokens()).to.be.revertedWith("Cooldown period not elapsed");

    // Set timestamp just before cooldown ends
    await time.setNextBlockTimestamp(lastClaimTime + BigInt(COOLDOWN_PERIOD) - 1n);
    console.log("After partial advance, block timestamp:", (await time.latest()).toString());
    await expect(faucet.connect(user).claimTokens()).to.be.revertedWith("Cooldown period not elapsed");

    // Set timestamp after full cooldownસ

    // Set timestamp after full cooldown
    await time.setNextBlockTimestamp(lastClaimTime + BigInt(COOLDOWN_PERIOD));
    const secondClaimTx = await faucet.connect(user).claimTokens();
    await secondClaimTx.wait();
    console.log("After full advance, block timestamp:", (await time.latest()).toString());
  });

  it("should enforce daily token limit", async function () {
    // Perform 50 claims with unique users
    for (let i = 0; i < 50; i++) {
      const user = users[i];
      await time.setNextBlockTimestamp((await time.latest()) + 1);
      const claimTx = await faucet.connect(user).claimTokens();
      await claimTx.wait();
    }

    console.log("Daily tokens dispensed:", (await faucet.dailyTokensDispensed()).toString());
    expect(await faucet.dailyTokensDispensed()).to.equal(DAILY_TOKEN_LIMIT);

    // Next claim should fail
    await expect(faucet.connect(users[0]).claimTokens()).to.be.revertedWith("Daily token limit reached");

    // Advance time to next day
    await time.increase(24 * 60 * 60);
    const resetClaimTx = await faucet.connect(users[0]).claimTokens();
    await resetClaimTx.wait();
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM);
  });

  it("should prevent claiming if faucet has insufficient tokens", async function () {
    const balance = await faucet.getFaucetBalance();
    await faucet.connect(owner).withdrawTokens(balance);

    await expect(faucet.connect(users[0]).claimTokens()).to.be.revertedWith("Faucet has insufficient tokens");
  });

  it("should allow owner to deposit and withdraw tokens", async function () {
    const depositAmount = ethers.parseEther("10000");
    await shdToken.connect(owner).approve(faucet.target, depositAmount);
    const depositTx = await faucet.connect(owner).depositTokens(depositAmount);
    await expect(depositTx)
      .to.emit(faucet, "TokensDeposited")
      .withArgs(owner.address, depositAmount, await time.latest());

    const withdrawAmount = ethers.parseEther("5000");
    const withdrawTx = await faucet.connect(owner).withdrawTokens(withdrawAmount);
    await expect(withdrawTx)
      .to.emit(faucet, "TokensWithdrawn")
      .withArgs(owner.address, withdrawAmount, await time.latest());

    const user = users[0];
    await shdToken.connect(user).approve(faucet.target, depositAmount);
    await expect(faucet.connect(user).depositTokens(depositAmount)).to.be.revertedWith("Only owner can call this function");
    await expect(faucet.connect(user).withdrawTokens(withdrawAmount)).to.be.revertedWith("Only owner can call this function");
  });

  it("should prevent zero-amount deposits/withdrawals", async function () {
    await expect(faucet.connect(owner).depositTokens(0)).to.be.revertedWith("Amount must be greater than 0");
    await expect(faucet.connect(owner).withdrawTokens(0)).to.be.revertedWith("Amount must be greater than 0");
  });

  
  it("should handle multiple daily resets correctly", async function () {
    // Perform initial claims to hit the limit
    for (let i = 0; i < 50; i++) {
      const user = users[i];
      await time.setNextBlockTimestamp((await time.latest()) + 1);
      await faucet.connect(user).claimTokens();
    }
    expect(await faucet.dailyTokensDispensed()).to.equal(DAILY_TOKEN_LIMIT);

    // Advance time by 24 hours and trigger a claim to reset
    await time.increase(24 * 60 * 60);
    await faucet.connect(users[0]).claimTokens();
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM);
    expect(await faucet.getDailyTokensRemaining()).to.equal(DAILY_TOKEN_LIMIT - TOKENS_PER_CLAIM);

    // Advance another 24 hours
    await time.increase(24 * 60 * 60);
    await faucet.connect(users[1]).claimTokens();
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM);
    expect(await faucet.getDailyTokensRemaining()).to.equal(DAILY_TOKEN_LIMIT - TOKENS_PER_CLAIM);
  });

  it("should revert deposit if owner has insufficient approval", async function () {
    const depositAmount = ethers.parseEther("10000");
    // Do not approve
    await expect(faucet.connect(owner).depositTokens(depositAmount)).to.be.revertedWithCustomError(shdToken, "ERC20InsufficientAllowance");
  });

  it("should revert withdraw if amount exceeds faucet balance", async function () {
    const excessAmount = (await faucet.getFaucetBalance()) + 1n;
    await expect(faucet.connect(owner).withdrawTokens(excessAmount)).to.be.revertedWith("Insufficient tokens in faucet");
  });

  it("should not allow claiming during the exact cooldown boundary", async function () {
    const user = users[0];
    await faucet.connect(user).claimTokens();
    const lastClaim = await faucet.getLastClaimTime(user.address);

    // Advance to exactly the cooldown time - should still revert
    await time.setNextBlockTimestamp(lastClaim + BigInt(COOLDOWN_PERIOD) - 1n);
    await expect(faucet.connect(user).claimTokens()).to.be.revertedWith("Cooldown period not elapsed");

    // Advance one more second - should allow
    await time.setNextBlockTimestamp(lastClaim + BigInt(COOLDOWN_PERIOD));
    await faucet.connect(user).claimTokens();
  });

  it("should handle large time jumps correctly for daily reset", async function () {
    // Advance time by a large amount (e.g., 10 days)
    await time.increase(10 * 24 * 60 * 60);
    expect(await faucet.getDailyTokensRemaining()).to.equal(DAILY_TOKEN_LIMIT);
    await faucet.connect(users[0]).claimTokens();
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM);
  });

  it("should handle concurrent claims in the same block", async function () {
    const user1 = users[0];
    const user2 = users[1];
    // Set same block timestamp for concurrent claims
    const currentTime = await time.latest();
    await time.setNextBlockTimestamp(currentTime + 1);
    
    // Perform two claims simultaneously
    const claim1 = faucet.connect(user1).claimTokens();
    const claim2 = faucet.connect(user2).claimTokens();
    await Promise.all([claim1, claim2]);

    // Verify both claims succeeded and state is consistent
    expect(await shdToken.balanceOf(user1.address)).to.equal(TOKENS_PER_CLAIM);
    expect(await shdToken.balanceOf(user2.address)).to.equal(TOKENS_PER_CLAIM);
    expect(await faucet.dailyTokensDispensed()).to.equal(TOKENS_PER_CLAIM * 2n);
  });

});