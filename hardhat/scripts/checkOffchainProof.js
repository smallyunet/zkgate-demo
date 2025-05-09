// scripts/checkOffchainProof.js
const fs     = require("fs");
const snarkjs = require("snarkjs");

async function main() {
  const proof         = JSON.parse(fs.readFileSync("./proof.json"));
  const publicSignals = JSON.parse(fs.readFileSync("./public.json"));
  const vk            = JSON.parse(fs.readFileSync("./verification_key.json"));

  const ok = await snarkjs.groth16.verify(vk, publicSignals, proof);
  console.log("📋 off-chain verify ok?", ok);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
