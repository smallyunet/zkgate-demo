#!/usr/bin/env bash

# Compile the smart contracts
npx hardhat compile

# Deploy contracts to the local network
npx hardhat run scripts/deploy.js \
  --network local

# Set environment variables for RPC URL and registry address
export RPC_URL="http://127.0.0.1:8545"
export REGISTRY="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

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
npx hardhat run scripts/fakeProof.js \
  --network local

# Generate a fake proof with the correct root for testing
npx hardhat run scripts/fakeProofWithCorrectRoot.js \
  --network local
