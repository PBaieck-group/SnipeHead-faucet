# SnipeHead Faucet

**SnipeHead**: `0x7E5A488756c3FEe54248f97a36dF5B0e9cf27d8d` - Main  
**SnipeHead Faucet**: `0x451f3EF744C6B942765E86BF82dB4F898c9dA67f` - Main  
**SnipeHead Faucet**: `0xfB7133c004b17D7459888B1cFf3b51cfB54Dafe0` - Testnet

**SnipeHead Faucet Fallback**: https://ipfs.io/ipfs/bafybeigo643sh275jirwmy2lgou7qanfsgjpxk4bcygaqyqodgoswhe4fe/

**bafybeigo643sh275jirwmy2lgou7qanfsgjpxk4bcygaqyqodgoswhe4fe** 

## Overview
The **SnipeHead Faucet** is a smart contract-based system designed to distribute free **SnipeHead (SHD)** tokens on the PulseChain blockchain. It allows users to claim a fixed amount of tokens periodically while enforcing cooldown periods and daily limits to prevent abuse. The project includes the core ERC20 token contract, the faucet contract, test contracts for vulnerability simulation, and a comprehensive test suite using Hardhat.  
This faucet promotes community engagement by providing easy access to SHD tokens for testing, development, or participation in the SnipeHead ecosystem on PulseChain.  

[Portal: https://www.snipehead.xyz](https://www.snipehead.xyz)

## Features
- **Token Claims**: Users can claim 5,000 SHD tokens every 24 hours.
- **Cooldown Enforcement**: 24-hour cooldown per user to prevent repeated claims.
- **Daily Limits**: Maximum of 250,000 SHD tokens dispensed per day across all users.
- **Reentrancy Protection**: Uses OpenZeppelin's `ReentrancyGuard` to secure against attacks.
- **Events**: Emits events for claims, deposits, and withdrawals for easy tracking.
- **View Functions**: Query faucet balance, user last claim time, and remaining daily tokens.

## Contracts

### SnipeHead.sol
The core ERC20 token contract for **SnipeHead (SHD)**. It mints the total supply to a specified recipient upon deployment.

- **Symbol**: SHD
- **Name**: SnipeHead
- **Total Supply**: 21,000,000,000 SHD (with 18 decimals)
- Inherits from OpenZeppelin's `ERC20` and `ERC20Permit` for compatibility with PulseChain.

### SnipeHeadFaucet.sol
The main faucet contract that handles token distribution on PulseChain.

#### Constants:
- **TOKENS_PER_CLAIM**: 5,000 SHD
- **COOLDOWN_PERIOD**: 24 hours
- **DAILY_TOKEN_LIMIT**: 250,000 SHD

#### Functions:
- **claimTokens()**: Allows users to claim tokens (non-reentrant).
- **depositTokens(uint256 amount)**: Owner deposits tokens into the faucet.
- **withdrawTokens(uint256 amount)**: Owner withdraws tokens from the faucet.
- **View Functions**:
  - `getFaucetBalance()`
  - `getLastClaimTime(address user)`
  - `getDailyTokensRemaining()`

Uses `IERC20` interface for token interactions.

### MaliciousToken.sol
A test contract simulating a malicious ERC20 token that can intentionally fail transfers.

- Used for testing edge cases in the faucet.

### MaliciousClaimer.sol
A test contract simulating a reentrancy attack on the faucet.

- Attempts to call `claimTokens()` recursively during an attack.


## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This contract is provided as-is. Interacting with smart contracts involves risk; always verify code and test thoroughly. The SnipeHead project is not responsible for any losses.