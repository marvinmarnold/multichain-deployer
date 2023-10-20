// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract HyperlaneMessageReceiver {
    event ReceivedMessage(uint32 origin, bytes32 sender, bytes message);

    function handle(
        uint32 _origin,
        bytes32 _sender, // HyperlaneMessageSender
        bytes calldata _message
    ) external {
        address senderAddress;
        bytes memory signature;
        bytes memory contractBytecode;

        (senderAddress, signature, contractBytecode) = abi.decode(
            _message,
            (address, bytes, bytes)
        );

        // Verify Signature

        // Deploy Contract using contractBytecode & senderAddress

        emit ReceivedMessage(_origin, _sender, _message);
    }
}
