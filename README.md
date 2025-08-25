SnipeHead Faucet
 
SnipeHead: '0x7E5A488756c3FEe54248f97a36dF5B0e9cf27d8d' - Main

SnipeHeadFaucet: '0x451f3EF744C6B942765E86BF82dB4F898c9dA67f' - Main

SnipeHeadFaucet: '0xfB7133c004b17D7459888B1cFf3b51cfB54Dafe0' - Testnet


Overview
The SnipeHead Faucet is a smart contract-based system designed to distribute free SnipeHead (SHD) tokens on the PulseChain blockchain. It allows users to claim a fixed amount of tokens periodically while enforcing cooldown periods and daily limits to prevent abuse. The project includes the core ERC20 token contract, the faucet contract, test contracts for vulnerability simulation, and a comprehensive test suite using Hardhat.
This faucet promotes community engagement by providing easy access to SHD tokens for testing, development, or participation in the SnipeHead ecosystem on PulseChain.
Portal: https://www.snipehead.xyz
Features

Token Claims: Users can claim 5,000 SHD tokens every 24 hours.
Cooldown Enforcement: 24-hour cooldown per user to prevent repeated claims.
Daily Limits: Maximum of 250,000 SHD tokens dispensed per day across all users.
Reentrancy Protection: Uses OpenZeppelin's ReentrancyGuard to secure against attacks.
Events: Emits events for claims, deposits, and withdrawals for easy tracking.
View Functions: Query faucet balance, user last claim time, and remaining daily tokens.

Contracts
SnipeHead.sol
The core ERC20 token contract for SnipeHead (SHD). It mints the total supply to a specified recipient upon deployment.

Symbol: SHD
Name: SnipeHead
Total Supply: 21,000,000,000 SHD (with 18 decimals)
Inherits from OpenZeppelin's ERC20 and ERC20Permit for compatibility with PulseChain.

SnipeHeadFaucet.sol
The main faucet contract that handles token distribution on PulseChain.

Constants:
TOKENS_PER_CLAIM: 5,000 SHD
COOLDOWN_PERIOD: 24 hours
DAILY_TOKEN_LIMIT: 250,000 SHD


Functions:
claimTokens(): Allows users to claim tokens (non-reentrant).
depositTokens(uint256 amount): Owner deposits tokens into the faucet.
withdrawTokens(uint256 amount): Owner withdraws tokens from the faucet.
View functions: getFaucetBalance(), getLastClaimTime(address user), getDailyTokensRemaining().


Uses IERC20 interface for token interactions.

MaliciousToken.sol
A test contract simulating a malicious ERC20 token that can intentionally fail transfers.

Used for testing edge cases in the faucet.

MaliciousClaimer.sol
A test contract simulating a reentrancy attack on the faucet.

Attempts to call claimTokens() recursively during an attack.

Installation
This project uses Hardhat for development, testing, and deployment. Prerequisites:

Node.js (v18+ recommended)
npm or yarn


Clone the repository:
git clone https://gitlab.com/pbaieck-group/SnipeHead-faucet.git
cd snipehead-faucet


Install dependencies:
npm install


Configure environment variables for PulseChain deployment:

Create a .env file based on .env.example.
Add your private key for PulseChain or PulseChain Testnet.



Usage
Local Development

Compile contracts:
npx hardhat compile


Run a local Hardhat node:
npx hardhat node


Deploy contracts locally (in a separate terminal):
npx hardhat run scripts/deploy.js --network localhost



Deployment to PulseChain

Update hardhat.config.js with your PulseChain network details:
Mainnet: https://rpc.pulsechain.com (Chain ID: 369)
Testnet: https://rpc.v4.testnet.pulsechain.com (Chain ID: 943)


Deploy to PulseChain:npx hardhat run scripts/deploy.js --network pulsechain


Deploy to PulseChain Testnet:npx hardhat run scripts/deploy.js --network pulsechainTestnet



Interacting with the Faucet

Claim Tokens: Call claimTokens() from a user wallet on PulseChain.
Deposit Tokens: Owner approves and calls depositTokens(amount) to fund the faucet.
Withdraw Tokens: Owner calls withdrawTokens(amount) to retrieve tokens.

Testing
The project includes a comprehensive test suite in old_SnipeHeadFaucet.test.js using Chai and Hardhat's network helpers.

Run tests:npx hardhat test



Tests cover:

Initial state and deployment.
Successful claims and cooldown enforcement.
Daily limits and resets.
Insufficient balance scenarios.
Owner-only functions (deposit/withdraw).
Edge cases like zero amounts, large time jumps, and concurrent claims.
Reentrancy protection (implicit via ReentrancyGuard).

Additional test contracts (MaliciousToken.sol, MaliciousClaimer.sol) simulate attack scenarios to ensure robustness.
Gas Reporting

Enable gas reporting in tests:npx hardhat test --gas



Coverage

Run solidity coverage:npx hardhat coverage



Configuration

hardhat.config.js:
Solidity version: 0.8.20
Networks:
Hardhat (local testing with 51 signers for simulating multiple users)
PulseChain (Mainnet, Chain ID: 369)
PulseChain Testnet (Chain ID: 943)


Mocha timeout: 40,000ms


package.json: Lists dependencies, including OpenZeppelin contracts, Hardhat plugins, and testing tools.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contributing
Contributions are welcome! Please fork the repository and submit a merge request on GitLab.
Contact
For questions or support, visit https://www.snipehead.xyz or open an issue on GitLab.