const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); //0.25 is the premium
const GAS_PRICE_LINK = 1e9; // calcualted value based on gas price of chain

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
    log("Mocks Deployed");
    log("------------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
