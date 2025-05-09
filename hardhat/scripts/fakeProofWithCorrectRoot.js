// scripts/fakeProofWithCorrectRoot.js
const hre = require("hardhat");

async function main() {
  // 1. Get the deployed contract instance
  const registry = await hre.ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Read the on-chain root
  const onChainRoot = await registry.root();
  console.log("🔗 on-chain root:", onChainRoot);

  // 3. Construct "fake" proof parameters: A/B/C all zeros, public input uses the correct root
  const a     = ["0", "0"];
  const b     = [
    ["0", "0"],
    ["0", "0"],
  ];
  const c     = ["0", "0"];
  const input = [ onChainRoot.toString() ];

  // 4. Call proveMembership
  console.log("🔍 Calling proveMembership with zeroproof + correct root…");
  const valid = await registry.proveMembership(a, b, c, input);

  // 5. Print result - definitely false, but won't revert
  console.log("🚫 Fake proof valid?", valid);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });