//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compoundSupply.sol";

contract CompEthSupplyTest {
    CEth public cEth;

    // cETH address for Mainnet: 0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5
    constructor(address _cEth) {
        cEth = CEth(_cEth);
    }

    // Allows contract to receive ETH
    receive() external payable {}

    // Supplys ETH to Compound cEth contract to get cEth in return
    function supplyEth() external payable {
        cEth.mint{value: msg.value}();
    }

    // Returns the contract's balance of cEth
    function getCEthBalance() external view returns (uint256) {
        return cEth.balanceOf(address(this));
    }

    // Returns exchange rate and supply interest rate for cEth
    function getRates()
        external
        returns (uint256 exchangeRate, uint256 supplyRate)
    {
        exchangeRate = cEth.exchangeRateCurrent();
        supplyRate = cEth.supplyRatePerBlock();
    }

    // Returns the amount of ETH supplied
    function balanceOfUnderlying() external returns (uint256) {
        return cEth.balanceOfUnderlying(address(this));
    }

    // Redeems cEth in exchange for ETH
    function redeem(uint256 redeemTokens) external {
        require(cEth.redeem(redeemTokens) == 0, "Redeem Failed");
    }
}
