// scripts/prove.js
const hre      = require("hardhat");
const fs       = require("fs");
const path     = require("path");
const snarkjs  = require("snarkjs");

async function main() {
  // 1. Attach to your on‐chain registry
  const registry = await hre.ethers.getContractAt(
    "ZkGateRegistry",
    process.env.REGISTRY
  );

  // 2. Load the raw proof & public signals
  const proofJson      = require(path.join(__dirname, "../proof.json"));
  const publicSignals  = require(path.join(__dirname, "../public.json"));

  // 3. Let snarkjs format the calldata for you
  const calldata = await snarkjs.groth16.exportSolidityCallData(
    proofJson,
    publicSignals
  );
  // e.g.: "0x123...,0x456...,0x789...,…"

  // 4. Clean up and split into an array
  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",");

  // 5. Destructure into A, B, C and the remaining public inputs
  const a     = [ argv[0],             argv[1]            ];
  const b     = [ [argv[2], argv[3]], [argv[4], argv[5]] ];
  const c     = [ argv[6],             argv[7]            ];
  const input = argv.slice(8);  // → [ root ]

  console.log("🔍 Parsed proof args:", { a, b, c, input });
  console.log("🔗 on-chain root:", await registry.root());
  console.log("📤 expected root:", input[0]);

  // 6. Call your registry’s proveMembership (which under the hood calls verifyProof)
  const valid = await registry.proveMembership(a, b, c, input);
  console.log("✅ Proof valid?", valid);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
