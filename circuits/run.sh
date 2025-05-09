#!/usr/bin/env bash

# Generate the R1CS, WASM, and symbol files for the Circom circuit
circom merkleSmtProof.circom \
  -l . \
  --r1cs \
  --wasm \
  --sym \
  -o build

# Generate the witness from the WASM and input JSON
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  inputs.json \
  witness.wtns

# Perform the Powers of Tau ceremony setup
snarkjs groth16 setup \
  build/merkleSmtProof.r1cs \
  powersOfTau28_hez_final_15.ptau \
  zk_root_0000.zkey

# Contribute to the zkey ceremony
snarkjs zkey contribute \
  zk_root_0000.zkey \
  zk_root_final.zkey \
  --name="1st" \
  -v

# Generate a proof from the final zkey and witness
snarkjs groth16 prove \
  zk_root_final.zkey \
  witness.wtns \
  proof.json \
  public.json

# Export the verification key from the final zkey
snarkjs zkey export verificationkey \
  zk_root_final.zkey \
  verification_key.json

# Verify the proof using the verification key and public signals
snarkjs groth16 verify \
  verification_key.json \
  public.json \
  proof.json

# Export a Solidity verifier contract
snarkjs zkey export solidityverifier \
  zk_root_final.zkey \
  contracts/Groth16Verifier.sol

# Attempt to generate a witness for a non-matching input
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  inputs_non.json \
  witness_non.wtns
