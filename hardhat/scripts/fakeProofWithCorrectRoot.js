const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const { Wallet } = ethers;

  // 1. Get the deployed contract instance
  const registry = await ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Read the on-chain root
  const onChainRoot = await registry.root();
  console.log("🔗 On-chain root:", onChainRoot);

  // 3. Construct "fake" proof parameters: A/B/C all zeros
  const a = ["0", "0"];
  const b = [
    ["0", "0"],
    ["0", "0"],
  ];
  const c = ["0", "0"];

  // 4. Construct input: [fake key, correct root]
  const input = [
    "0",              // fake key (address 0)
    onChainRoot.toString(), // real on-chain root
  ];

  // 5. Generate a signature with a dummy key on the correct root
  const dummyWallet = Wallet.createRandom();
  const rootBytes = ethers.getBytes(onChainRoot);
  const signature = await dummyWallet.signMessage(rootBytes);

  console.log("🔍 Calling proveMembershipAndOwnership with zero proof + correct root + fake signature…");
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
