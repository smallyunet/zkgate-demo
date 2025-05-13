// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Groth16Verifier.sol";

/// @title zkgate.fun on-chain registry with proof/signature binding
/// @notice Admin can update the root; anyone can zk-prove membership + prove ownership via signature
contract ZkGateRegistry is Groth16Verifier {
    bytes32 public root;
    address public admin;

    event RootUpdated(bytes32 oldRoot, bytes32 newRoot);

    constructor(bytes32 _initialRoot) {
        admin = msg.sender;
        root  = _initialRoot;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    function updateRoot(bytes32 newRoot) external onlyAdmin {
        emit RootUpdated(root, newRoot);
        root = newRoot;
    }

    /// @notice Verify zk proof of membership + verify ownership via signature
    /// @param _pA, _pB, _pC  SNARK proof parameters
    /// @param _pubSignals    public inputs: [root, key]
    /// @param _signature     signature of message `root` by the key's private key (standard EVM personal_sign)
    function proveMembershipAndOwnership(
        uint[2]    calldata _pA,
        uint[2][2] calldata _pB,
        uint[2]    calldata _pC,
        uint[2]    calldata _pubSignals,
        bytes calldata _signature
    ) external view returns (bool) {
        // Read public inputs
        bytes32 proofRoot = bytes32(_pubSignals[1]);
        uint256 proofKey  = _pubSignals[0];

        // Check Merkle Root matches current stored
        require(proofRoot == root, "bad root");

        // Recover address from signature
        bytes32 messageHash = prefixed(proofRoot);
        address recoveredAddress = recoverSigner(messageHash, _signature);

        // Check recovered address matches proof's public key
        require(uint160(recoveredAddress) == proofKey, "proof/signature mismatch");

        // Verify zk proof itself
        return verifyProof(_pA, _pB, _pC, _pubSignals);
    }

    /// @dev EIP-191 personal_sign recovery
    function recoverSigner(bytes32 message, bytes memory sig) public pure returns (address) {
        require(sig.length == 65, "bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "bad v");
        return ecrecover(message, v, r, s);
    }

    /// @dev add Ethereum-specific prefix to a hash
    function prefixed(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
