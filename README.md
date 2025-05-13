# ZKGate 0.2.0 Demo

A zero-knowledge sparse Merkle tree proof system with on-chain verification **plus EVM address signature binding**, using Circom, snarkjs, and Hardhat.

Supports proving Merkle membership **AND** ownership via signature — so nobody can hijack another address’s Merkle proof.

## Directory Structure

```
.
├── circuits/        # Circom circuit & SNARK setup
├── hardhat/         # Smart contracts, scripts & verifier
└── offchain/        # Off-chain proof input generators
```

## Prerequisites

- Node.js (≥ 16.x)
- npm
- [Anvil](https://book.getfoundry.sh/) (Foundry)
- [Circom 2.x](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)
- [Hardhat](https://hardhat.org/)

## Installation

Install global tools:

```
npm install -g snarkjs
npm install -g circom
```

Clone and install project:

```
git clone <your-repo-url> zkgate
cd zkgate
```

Install local dependencies:

```
cd offchain && npm install
cd ../circuits && npm install
cd ../hardhat && npm install
```

## Running a Local Node

```
anvil
```

## 1. Generate Off-Chain SMT Proof Inputs

```
cd offchain
node smt.js             # generates inputs.json for member
node smt_non_member.js  # generates inputs_non.json for non-member
```

## 2. Circuit Compilation & Trusted Setup

```
cd circuits
```

Compile the circuit:

```
circom merkleSmtProof.circom -l . --r1cs --wasm --sym -o build
```

Generate witness for member:

```
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  ../offchain/inputs.json \
  witness.wtns
```

Trusted setup:

```
snarkjs groth16 setup \
  build/merkleSmtProof.r1cs \
  powersOfTau28_hez_final_15.ptau \
  zk_root_0000.zkey

snarkjs zkey contribute \
  zk_root_0000.zkey \
  zk_root_final.zkey \
  --name="1st" -v
```

Generate proof:

```
snarkjs groth16 prove \
  zk_root_final.zkey \
  witness.wtns \
  proof.json public.json
```

Export verifier:

```
snarkjs zkey export verificationkey zk_root_final.zkey verification_key.json
snarkjs zkey export solidityverifier zk_root_final.zkey contracts/Groth16Verifier.sol
```

Verify proof locally:

```
snarkjs groth16 verify \
  verification_key.json \
  public.json \
  proof.json
```

Optional: witness for non-member proof:

```
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  ../offchain/inputs_non.json \
  witness_non.wtns
```

## 3. Contract Deployment & Proof Verification

```
cd hardhat
```

Compile and deploy to local anvil:

```
npx hardhat compile
npx hardhat run scripts/deploy.js --network local
```

Set environment variables:

```
export RPC_URL="http://127.0.0.1:8545"
export REGISTRY="<DeployedContractAddress>"
export SIGNER_PRIVATE_KEY="<YourTestPrivateKey>"
```

Update on-chain Merkle root:

```
npx hardhat run scripts/updateRoot.js --network local
```

Read root from contract:

```
cast call "$REGISTRY" "root()" --rpc-url "$RPC_URL"
```

Verify proof off-chain:

```
node scripts/checkOffchainProof.js
```

Prove membership **and** EVM ownership on-chain:

```
npx hardhat run scripts/prove.js --network local
```

Test: reject totally fake proof (wrong key, root, sig):

```
npx hardhat run scripts/fakeProof.js --network local
```

Test: reject fake proof with correct root:

```
npx hardhat run scripts/fakeProofWithCorrectRoot.js --network local
```

## Scripts Summary

- `offchain/smt.js` – Generate Merkle inputs for a valid member.
- `offchain/smt_non_member.js` – Generate inputs for a non-member test case.
- `circuits/run.sh` – One-shot runner for Circom compilation & trusted setup.
- `hardhat/scripts/deploy.js` – Deploy the verifier & registry contracts.
- `hardhat/scripts/updateRoot.js` – Set a new SMT root in the contract.
- `hardhat/scripts/prove.js` – Submit proof + signature on-chain.
- `hardhat/scripts/fakeProof.js` – Test rejection of totally fake proof.
- `hardhat/scripts/fakeProofWithCorrectRoot.js` – Test rejection of a fake proof with a correct root.

## License

MIT © 2025
