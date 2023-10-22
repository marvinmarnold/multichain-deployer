// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/utils/Address.sol";

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
        bytes32 salt;
        bytes memory contractBytecode;

        (senderAddress, salt, contractBytecode) = abi.decode(
            _message,
            (address, bytes32, bytes)
        );

        // Deploy Contract using contractBytecode & senderAddress
        address deployedAddress = deploy(salt, contractBytecode);
        emit ReceivedMessage(_origin, _sender, deployedAddress);
    }

    function deploy(
        bytes32 _salt,
        bytes memory _byteCode
    ) internal returns (address) {
        return Create2.deploy(0, _salt, _byteCode);
    }

    function getAddress(
        bytes32 _salt,
        bytes memory _byteCode
    ) public view returns (address) {
        return Create2.computeAddress(_salt, keccak256(_byteCode));
    }
}
