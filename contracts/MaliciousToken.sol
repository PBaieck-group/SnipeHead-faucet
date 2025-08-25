// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MaliciousToken is ERC20 {
    bool public transferFail;

    constructor(address recipient) ERC20("MaliciousToken", "MTK") {
        _mint(recipient, 21000000000 * 10 ** decimals());
    }

    function setTransferFail(bool _fail) external {
        transferFail = _fail;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        if (transferFail) {
            revert("Transfer failed intentionally");
        }
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        if (transferFail) {
            revert("Transfer failed intentionally");
        }
        return super.transferFrom(sender, recipient, amount);
    }
}