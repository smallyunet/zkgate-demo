import fs from "fs";
import { smt } from "circomlibjs";

const { newMemEmptyTrie } = smt;

(async () => {
  // Initialize SMT and insert original members
  console.log("Initializing SMT for non-member proof...");
  const tree = await newMemEmptyTrie();

  const members = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  ];
  const toField = (address) => BigInt(address);

  for (const address of members) {
    await tree.insert(toField(address), 1n);
  }
  console.log(`SMT root after inserts: ${tree.root}`);

  // Define a non-member address for the (failing) inclusion proof
  const nonMemberAddress = "0x1234567890123456789012345678901234567890";
  const proofKey = toField(nonMemberAddress);
  const { siblings } = await tree.find(proofKey);
  const depth = 20;
  const paddedSiblings = siblings.concat(Array(depth - siblings.length).fill(0n));

  // Prepare SNARK inputs (value=1 is intentionally incorrect)
  const inputs = {
    key: proofKey.toString(),
    value: "1",
    root: tree.root.toString(),
    siblings: paddedSiblings.map((s) => s.toString()),
  };

  // Write inputs_non.json
  fs.writeFileSync("inputs_non.json", JSON.stringify(inputs, null, 2));
  console.log("Non-member proof inputs written to inputs_non.json");
})();
