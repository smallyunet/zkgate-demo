const hre = require("hardhat");
const path = require("path");

async function main() {
  const { ethers } = hre;
  const { Wallet } = ethers;

  // 1. Get the deployed contract instance
  const registry = await ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Construct "fake" proof parameters: all zeros
  const a = ["0", "0"];
  const b = [
    ["0", "0"],
    ["0", "0"],
  ];
  const c = ["0", "0"];
  const input = [
    "0", // fake key
    "0", // fake root
  ];

  // 3. Create a dummy wallet (ethers v6 compatible)
  const dummyWallet = Wallet.createRandom();

  // 4. Create a fake signature of fake root (32 zero bytes)
  const fakeRootBytes = ethers.getBytes("0x" + "00".repeat(32));
  const signature = await dummyWallet.signMessage(fakeRootBytes);

  console.log("🔍 Calling proveMembershipAndOwnership with all-zero proof + fake signature…");
  try {
    const valid = await registry.proveMembershipAndOwnership(a, b, c, input, signature);
    console.log("🚫 Fake proof valid?", valid);
  } catch (err) {
    console.error("💥 Expected revert caught:", err.message || err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
