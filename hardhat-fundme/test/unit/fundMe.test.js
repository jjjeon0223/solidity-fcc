const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendVal = ethers.utils.parseEther("1");
  beforeEach(async function () {
    //deploy fundme contract using hardhat-deploy
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", async function () {
    it("sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("fund", async function () {
    it("fails if not enough eth", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });
    it("updates amount funded data struc", async function () {
      await fundMe.fund({ value: sendVal });
      const res = await fundMe.addressToAmountFunded(deployer);
      assert.equal(res.toString(), sendVal);
    });
    it("update funders array", async function () {
      await fundMe.fund({ value: sendVal });
      const res = await fundMe.funders(0);
      assert.equal(res, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendVal });
    });

    it("withdraw eth from single founder", async function () {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionRes = await fundMe.withdraw();
      const transactionReceipt = await transactionRes.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundingBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundingBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
    it("allows withdrawl from multiple funders", async function () {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendVal });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();

      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
      console.log(`GasCost: ${withdrawGasCost}`);
      console.log(`GasUsed: ${gasUsed}`);
      console.log(`GasPrice: ${effectiveGasPrice}`);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      // Assert
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(withdrawGasCost).toString()
      );
      // Make a getter for storage variables
      await expect(fundMe.getFunder(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("only allows owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerContract = await fundMe.connect(attacker);
      await expect(attackerContract.withdraw()).to.be.reverted;
    });
  });
});
