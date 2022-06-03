const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { time } = require("@openzeppelin/test-helpers");
require("dotenv").config();

describe("Compound ETH Supply and Redeem", function () {

  const cEthAddress = "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5";
  const decimals = 18;
  const cEthDecimals = 8;

  let compoundSupplyTest;
  let deployer;

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("CompEthSupplyTest");
    compoundSupplyTest = await contractFactory.deploy(cEthAddress);
  });

  // Gets current details of rates and balances
  const snapShot = async (compoundSupplyTest) => {
    const { exchangeRate, supplyRate } = await compoundSupplyTest.callStatic.getRates();
    const balanceOfUnderlying = await compoundSupplyTest.callStatic.balanceOfUnderlying();
    const cEthBalance = await compoundSupplyTest.getCEthBalance();
    const contractEthBalance = await ethers.provider.getBalance(compoundSupplyTest.address);

    return {
      exchangeRate,
      supplyRate,
      balanceOfUnderlying,
      cEthBalance,
      contractEthBalance,
    }
  };

  it("Should supply and redeem ETH", async function () {
    let currentSnapShot = await snapShot(compoundSupplyTest);

    console.log("\n", "---Before Supplying to Compound---");
    console.log(`Balance of Underlying: ${currentSnapShot.balanceOfUnderlying / 10 ** decimals}`);
    console.log(`Contract CEth Balance: ${currentSnapShot.cEthBalance / 10 ** cEthDecimals}`);
    console.log("Amount of ETH to be supplied: 100");

    // Supplying 100 ETH to Compound
    await compoundSupplyTest.supplyEth({ value: parseEther("100") });

    currentSnapShot = await snapShot(compoundSupplyTest);

    console.log("\n", "---Supply---");
    console.log(`Exchange Rate: ${currentSnapShot.exchangeRate / (10 ** 18)}`);
    console.log(`Supply Rate (in Wei): ${currentSnapShot.supplyRate}`);
    console.log(`Balance of Underlying: ${currentSnapShot.balanceOfUnderlying / 10 ** decimals}`);
    console.log(`Contract CEth Balance: ${currentSnapShot.cEthBalance / 10 ** cEthDecimals}`);
    console.log(`Contract ETH Balance: ${currentSnapShot.contractEthBalance}`);

    // Waiting until 200 blocks have passed
    const block = await web3.eth.getBlockNumber();
    await time.advanceBlockTo(block + 200);

    currentSnapShot = await snapShot(compoundSupplyTest);

    // ETH balance is supposed to increase as time passes to show accrued interest
    console.log("\n", "---After 200 blocks---");
    console.log(`Balance of Underlying: ${currentSnapShot.balanceOfUnderlying / 10 ** decimals}`);

    // Redeeming cEth to get back ETH
    const redeemAmount = await compoundSupplyTest.getCEthBalance();
    await compoundSupplyTest.redeem(redeemAmount);

    currentSnapShot = await snapShot(compoundSupplyTest);

    console.log("\n", "---Redeem---");
    console.log(`Exchange Rate: ${currentSnapShot.exchangeRate / (10 ** 18)}`);
    console.log(`Balance of Underlying: ${currentSnapShot.balanceOfUnderlying / 10 ** decimals}`);
    console.log(`Contract CEth Balance: ${currentSnapShot.cEthBalance / 10 ** cEthDecimals}`);
    console.log(`Contract ETH Balance: ${currentSnapShot.contractEthBalance / 10 ** decimals}`);
  });

});
