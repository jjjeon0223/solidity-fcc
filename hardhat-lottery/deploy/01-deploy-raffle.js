const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const transactionRes = await VRFCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionRes.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    await VRFCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      ethers.utils.parseEther("2")
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1 || network.config.blockConfirmations,
  });
};
