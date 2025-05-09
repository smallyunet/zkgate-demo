# ZKGate Demo

A zero-knowledge Merkle-sparse-Merkle-tree proof system with on-chain verification via Hardhat and Circom.

## Directory Structure

```
.
├── circuits/        # Circom circuit & SNARK setup
├── hardhat/         # Smart contracts & deployment scripts
└── offchain/        # Off-chain proof input generators
```

## Prerequisites

- [Node.js (≥ 16.x)](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Anvil (Foundry)](https://book.getfoundry.sh/)
- [Circom 2.0](https://docs.circom.io/) & snarkjs
- [Hardhat](https://hardhat.org/)

## Installation

Install global tools (if not already installed):

```bash  
npm install -g snarkjs  
npm install -g circom  
```

Clone and install dependencies:

```bash  
git clone <your-repo-url> zkgate  
cd zkgate  
```

# Off-chain generator  
```bash  
cd offchain  
npm install  
```

# Circuits  
```bash  
cd ../circuits  
npm install  
```

# Hardhat  
```bash  
cd ../hardhat  
npm install  
```

## Running a Local Node

In terminal window 1:

```bash  
anvil  
```

## 1. Off-Chain SMT Proof Inputs

In terminal window 2:

```bash  
cd offchain  
node smt.js  
# generates inputs.json for member proof  
```

```bash  
node smt_non_member.js  
# generates inputs_non.json for non-member proof  
```

## 2. Circuit Compilation & Trusted Setup

In terminal window 3:

```bash  
cd circuits  
```

Compile the circuit  
```
circom merkleSmtProof.circom \
  -l . \
  --r1cs --wasm --sym \
  -o build  
```

Generate witness for member proof  
```
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  ../offchain/inputs.json \
  witness.wtns  
```

Trusted setup  
```
snarkjs groth16 setup \
  build/merkleSmtProof.r1cs \
  powersOfTau28_hez_final_15.ptau \
  zk_root_0000.zkey  
```

```
snarkjs zkey contribute \
  zk_root_0000.zkey zk_root_final.zkey \
  --name="1st" -v  
```

Generate the proof  
```
snarkjs groth16 prove \
  zk_root_final.zkey \
  witness.wtns \
  proof.json public.json  
```

Export verifier  
```
snarkjs zkey export verificationkey \
  zk_root_final.zkey \
  verification_key.json  
```
```
snarkjs zkey export solidityverifier \
  zk_root_final.zkey \
  contracts/Groth16Verifier.sol  
```

Verify proof locally  
```
snarkjs groth16 verify \
  verification_key.json \
  public.json proof.json  
```

(Optional) Witness for non-member proof 
``` 
node build/merkleSmtProof_js/generate_witness.js \
  build/merkleSmtProof_js/merkleSmtProof.wasm \
  ../offchain/inputs_non.json \
  witness_non.wtns  
```

## 3. Smart Contract Deployment & Verification

In terminal window 4:

```bash  
cd hardhat  
```

Compile and deploy to local Anvil
```  
npx hardhat compile  
npx hardhat run scripts/deploy.js --network local  
```

Set environment variables  
```
export RPC_URL="http://127.0.0.1:8545"  
export REGISTRY="<DeployedRegistryAddress>"  
```

Off-chain sanity check  
```
node scripts/checkOffchainProof.js  
```

Read on-chain root  
```
cast call "$REGISTRY" "root()" --rpc-url "$RPC_URL"  
```

Update on-chain root  
npx hardhat run scripts/updateRoot.js --network local  
```

Prove membership on-chain  
npx hardhat run scripts/prove.js --network local  
```

Test revert for fake proof
```  
npx hardhat run scripts/fakeProof.js --network local  
```

## Scripts

- offchain/smt.js – Generate inputs.json for member proof.  
- offchain/smt_non_member.js – Generate inputs_non.json for non-member proof.  
- circuits/run.sh – Full pipeline for Circom compilation & SNARK setup.  
- hardhat/scripts/deploy.js – Deploy verifier & registry contracts.  
- hardhat/scripts/updateRoot.js – Update on-chain Merkle root.  
- hardhat/scripts/prove.js – Call proveMembership on-chain.  
- hardhat/scripts/fakeProof.js – Test failure case with bad proof.  
- hardhat/scripts/checkOffchainProof.js – Verify proof against on-chain root off-chain.  

## License

MIT © 2025
