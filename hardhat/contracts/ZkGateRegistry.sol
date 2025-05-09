// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// 1) import the auto‐generated verifier
import "./Groth16Verifier.sol";

/// @title zkgate.fun on-chain registry
/// @notice Admin can update the root; anyone can zk-prove membership
contract ZkGateRegistry is Groth16Verifier {
    /// @dev the current Merkle/SMT root (as bytes32)
    bytes32 public root;

    /// @dev only this address may rotate the root
    address public admin;

    event RootUpdated(bytes32 oldRoot, bytes32 newRoot);

    /// @param _initialRoot the very first SMT root (in hex, as bytes32)
    constructor(bytes32 _initialRoot) {
        admin = msg.sender;
        root  = _initialRoot;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    /// @notice change the root when your off-chain list changes
    function updateRoot(bytes32 newRoot) external onlyAdmin {
        emit RootUpdated(root, newRoot);
        root = newRoot;
    }

    /// @notice Verify a Groth16 proof of membership under the current root
    /// @param _pA, _pB, _pC  the SNARK proof parameters
    /// @param _pubSignals    the public inputs array: must be [root]
    function proveMembership(
        uint[2]    calldata _pA,
        uint[2][2] calldata _pB,
        uint[2]    calldata _pC,
        uint[1]    calldata _pubSignals
    ) external view returns (bool) {
        // 1) ensure the proof’s public input is our stored root
        require(bytes32(_pubSignals[0]) == root, "bad root");

        // 2) call into the low-level pairing checks
        return verifyProof(_pA, _pB, _pC, _pubSignals);
    }
}
