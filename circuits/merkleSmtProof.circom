pragma circom 2.2.2;
include "circomlib/circuits/smt/smtverifier.circom";

template SparseMerkleInclusion(nLevels) {
    signal input key;
    signal input value;
    signal input siblings[nLevels];
    signal input root;

    component v = SMTVerifier(nLevels);
    v.enabled <== 1;
    v.fnc     <== 0;
    v.isOld0  <== 0;

    v.oldKey   <== key;
    v.oldValue <== value;
    v.key      <== key;
    v.value    <== value;

    for (var i = 0; i < nLevels; i++) {
        v.siblings[i] <== siblings[i];
    }
    v.root <== root;
}

// Here is the only change: mark `root` public
component main { public [ root, key ] } = SparseMerkleInclusion(20);
