//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface CEth {
    function balanceOf(address owner) external view returns (uint256);

    function balanceOfUnderlying(address owner) external returns (uint256);

    function supplyRatePerBlock() external view returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function mint() external payable;

    function redeem(uint256 redeemTokens) external returns (uint256);
}
