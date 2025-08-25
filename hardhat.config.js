require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

// Custom task to list accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  console.log(`Number of accounts: ${accounts.length}`);
  for (let i = 0; i < accounts.length; i++) {
    console.log(`Account ${i}: ${accounts[i].address}`);
  }
});

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: {
        count: 51 // Support 51 signers (1 owner + 50 users)
      }
    },
    pulsechain: {
      url: "https://rpc.pulsechain.com",
      chainId: 369,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    pulsechainTestnet: {
      url: "https://rpc-testnet.pulsechain.com",
      chainId: 943,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  mocha: {
    timeout: 40000
  }
};