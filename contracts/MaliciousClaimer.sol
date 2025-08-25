// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISnipeHeadFaucet {
    function claimTokens() external;
}

contract MaliciousClaimer {
    ISnipeHeadFaucet public faucet;
    bool private attacking;

    constructor(address _faucet) {
        faucet = ISnipeHeadFaucet(_faucet);
        attacking = false;
    }

    function attack() external {
        attacking = true;
        faucet.claimTokens();
        if (attacking) {
            faucet.claimTokens(); // Attempt reentrancy
        }
        attacking = false;
    }
}