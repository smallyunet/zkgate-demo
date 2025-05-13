const hre = require("hardhat");
const path = require("path");

async function main() {
  const { ethers } = hre;

  const registry = await ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  const publicJson = require(path.join(__dirname, "../public.json"));
  const decRoot = publicJson[1].toString();  //  index 1 (root)

  const newRoot = ethers.zeroPadValue(
    ethers.toBeHex(BigInt(decRoot)),
    32
  );

  console.log("Updating on-chain root to:", newRoot);

  const [admin] = await ethers.getSigners();
  const tx = await registry.connect(admin).updateRoot(newRoot);
  await tx.wait();

  console.log("✅ Root updated on-chain");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
