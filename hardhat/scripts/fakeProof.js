// scripts/fakeProof.js
const hre = require("hardhat");

async function main() {
  // 1. Get the deployed contract instance
  const registry = await hre.ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Construct "fake" proof parameters: all zeros
  const a     = ["0", "0"];
  const b     = [
    ["0", "0"],
    ["0", "0"],
  ];
  const c     = ["0", "0"];
  const input = ["0"];  // public input (root) is also set to 0

  // 3. Call proveMembership
  console.log("🔍 Calling proveMembership with all-zero proof…");
  const valid = await registry.proveMembership(a, b, c, input);

  // 4. Print result - definitely false
  console.log("🚫 Fake proof valid?", valid);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });