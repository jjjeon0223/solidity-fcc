import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const transactionRes = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    await listenTransactionMine(transactionRes, provider);
    console.log("Funding done");
  }
}

function listenTransactionMine(transactionRes, provider) {
  console.log(`Mining ${transactionRes.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionRes.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionRes = await contract.withdraw();
      await listenTransactionMine(transactionRes, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
