// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1) Deploy the verifier
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment(); 
  console.log("Verifier deployed to:", verifier.target);

  // 2) Convert your decimal root → bytes32 hex
  const decRoot = "12160351338597723880992389398414821172181087862151581936107280485161994580757";
  const hexUnpadded = BigInt(decRoot).toString(16);
  const initialRoot = "0x" + hexUnpadded.padStart(64, "0");

  // 3) Deploy your registry
  const Registry = await hre.ethers.getContractFactory("ZkGateRegistry");
  const registry = await Registry.deploy(initialRoot);
  await registry.waitForDeployment();
  console.log("Registry deployed to:", registry.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
