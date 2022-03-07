// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts@4.5.0/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts@4.5.0/access/Ownable.sol";

contract Mgtoken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("mgtoken", "mgt") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transferERC20(IERC20 token, address to) public onlyOwner {
        
        uint256 erc20balance = token.balanceOf(address(this));
        token.transfer(to, erc20balance);
        
    }     
}

// https://remix.ethereum.org/?#code=Ly8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVApwcmFnbWEgc29saWRpdHkgXjAuOC40OwoKaW1wb3J0ICJAb3BlbnplcHBlbGluL2NvbnRyYWN0c0A0LjUuMC90b2tlbi9FUkMyMC9FUkMyMC5zb2wiOwppbXBvcnQgIkBvcGVuemVwcGVsaW4vY29udHJhY3RzQDQuNS4wL3Rva2VuL0VSQzIwL2V4dGVuc2lvbnMvRVJDMjBCdXJuYWJsZS5zb2wiOwppbXBvcnQgIkBvcGVuemVwcGVsaW4vY29udHJhY3RzQDQuNS4wL2FjY2Vzcy9Pd25hYmxlLnNvbCI7Cgpjb250cmFjdCBNZ3Rva2VuIGlzIEVSQzIwLCBFUkMyMEJ1cm5hYmxlLCBPd25hYmxlIHsKICAgIGNvbnN0cnVjdG9yKCkgRVJDMjAoIm1ndG9rZW4iLCAibWd0Iikge30KCiAgICBmdW5jdGlvbiBtaW50KGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSBwdWJsaWMgb25seU93bmVyIHsKICAgICAgICBfbWludCh0bywgYW1vdW50KTsKICAgIH0KfQo&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.7+commit.e28d00a7.js