import fs from "fs";
import { smt } from "circomlibjs";

const { newMemEmptyTrie } = smt;

(async () => {
  // Initialize a new sparse Merkle tree
  console.log("Initializing SMT...");
  const tree = await newMemEmptyTrie();
  console.log(`SMT root: ${tree.root}`);

  // List of member addresses to include in the SMT
  const members = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  ];

  // Helper: convert address string to BigInt field element
  const toField = (address) => BigInt(address);

  // Insert each member with value = 1n
  for (const address of members) {
    const key = toField(address);
    await tree.insert(key, 1n);
    console.log(`Inserted member ${address}. Updated root: ${tree.root}`);
  }

  // Generate inclusion proof for the first member
  const proofKey = toField(members[0]);
  const { siblings } = await tree.find(proofKey);
  const depth = 20;
  const paddedSiblings = siblings.concat(Array(depth - siblings.length).fill(0n));

  // Prepare SNARK inputs
  const inputs = {
    key: proofKey.toString(),
    value: "1",
    root: tree.root.toString(),
    siblings: paddedSiblings.map((s) => s.toString()),
  };

  // Write inputs.json
  fs.writeFileSync("inputs.json", JSON.stringify(inputs, null, 2));
  console.log("Proof inputs written to inputs.json");
})();