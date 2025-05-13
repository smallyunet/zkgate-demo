#!/usr/bin/env bash

# Compile the smart contracts
npx hardhat compile

# Deploy contracts to the local network
npx hardhat run scripts/deploy.js \
  --network local

# Set environment variables for RPC URL and registry address
export RPC_URL="http://127.0.0.1:8545"
export REGISTRY="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
export SIGNER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Check the off-chain proof validity
node scripts/checkOffchainProof.js

# Call the root() function on the registry contract
cast call "$REGISTRY" "root()" \
  --rpc-url "$RPC_URL"

# Update the on-chain root value
npx hardhat run scripts/updateRoot.js \
  --network local

# Generate a proof using the updated root
npx hardhat run scripts/prove.js \
  --network local

# Generate a fake proof for testing purposes
npx hardhat run scripts/fakeProofWithBadRoot.js \
  --network local

# Generate a fake proof with the correct root for testing
npx hardhat run scripts/fakeProofWithCorrectRoot.js \
  --network local
