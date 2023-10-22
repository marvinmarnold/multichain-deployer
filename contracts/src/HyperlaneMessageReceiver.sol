// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "forge-std/console.sol";

contract HyperlaneMessageReceiver {
    event ReceivedMessage(
        uint32 origin,
        bytes32 sender,
        address deployedContract
    );

    function handle(
        uint32 _origin,
        bytes32 _sender, // HyperlaneMessageSender
        bytes calldata _message
    ) external payable {
        address senderAddress;
        uint256 salt;
        bytes memory contractBytecode;

        (senderAddress, salt, contractBytecode) = abi.decode(
            _message,
            (address, uint256, bytes)
        );

        // Deploy Contract using contractBytecode & senderAddress
        address deployedAddress = deploy(salt, contractBytecode);
        emit ReceivedMessage(_origin, _sender, deployedAddress);
    }

    function deploy(
        uint256 _salt,
        bytes memory _byteCode
    ) internal returns (address) {
        // Create the contract using the provided bytecode and salt
        address deployedAddress;
        assembly {
            deployedAddress := create2(
                0,
                add(_byteCode, 0x20),
                mload(_byteCode),
                _salt
            )
            if iszero(extcodesize(deployedAddress)) {
                revert(0, 0)
            }
        }
        return deployedAddress;
    }

    /** Compute the address of the contract to be deployed
     *  params:
     *    _salt: random unsigned number used to precompute an address
     *    _bytecode: bytecode of the contract to be deployed
     */
    function getAddress(
        bytes memory _byteCode
    ) public view returns (address) {
        // Get a hash concatenating args passed to encodePacked
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff), // 0
                address(this), // address of factory contract
                salt, // a random salt
                keccak256(_byteCode) // the wallet contract bytecode
            )
        );
        // Cast last 20 bytes of hash to address
        return address(uint160(uint256(hash)));
    }
}
