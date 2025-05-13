const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const ethers = hre.ethers;

async function main() {
  // 1. Attach to your deployed contract
  const registry = await hre.ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Load proof & public signals
  const proofJson = require(path.join(__dirname, "../proof.json"));
  const publicSignals = require(path.join(__dirname, "../public.json"));

  // 3. Format calldata via snarkjs
  const calldata = await snarkjs.groth16.exportSolidityCallData(
    proofJson,
    publicSignals
  );

  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",");

  const a = [argv[0], argv[1]];
  const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
  const c = [argv[6], argv[7]];
  const input = argv.slice(8);  // → [ root, key ]

  // 4. Get root & key from inputs
  const key = input[0];
  const root = input[1];

  console.log("🔍 Parsed proof args:", { a, b, c, input });
  console.log("🔗 On-chain root:", await registry.root());
  console.log("📤 Expected root:", root);
  console.log("📤 Proof key (as uint256):", key);

  // 5. Simulate signing the message (root)
  //    You need the private key corresponding to `key`
  const keyWallet = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);
  const signature = await keyWallet.signMessage(ethers.getBytes(root));

  const proofKeyBigInt = BigInt(key);
  const proofKeyHex = '0x' + proofKeyBigInt.toString(16).padStart(64, '0');
  const proofKeyAddress = ethers.getAddress(`0x${proofKeyHex.slice(-40)}`);

  console.log("🔑 Proof key (as address):", proofKeyAddress);
  console.log("✍️  Simulated signer address:", keyWallet.address);

  // 6. Call the new proveMembershipAndOwnership
  const valid = await registry.proveMembershipAndOwnership(a, b, c, input, signature);
  console.log("✅ Proof + Signature valid?", valid);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
