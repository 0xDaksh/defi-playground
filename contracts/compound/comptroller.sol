// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ComptrollerInterface {
    function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory);

    function exitMarket(address cToken) external returns (uint256);
}
