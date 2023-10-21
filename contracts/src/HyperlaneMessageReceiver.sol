// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract HyperlaneMessageReceiver {
    event ReceivedMessage(uint32 origin, bytes32 sender, address deployedContract);
    uint256 salt=1;
    function handle(
        uint32 _origin,
        bytes32 _sender, // HyperlaneMessageSender
        bytes calldata _message
    ) payable external {
        address senderAddress;
        bytes memory signature;
        bytes memory contractBytecode;

        (senderAddress, signature, contractBytecode) = abi.decode(
            _message,
            (address, bytes, bytes)
        );

        // Verify Signature
        // require(verify(senderAddress, signature, contractBytecode));
        // Deploy Contract using contractBytecode & senderAddress
        address deployedAddress = deploy(salt,contractBytecode);
        salt+=1;
        emit ReceivedMessage(_origin, _sender, deployedAddress);
    }

    function deploy(uint256 _salt,bytes memory _byteCode) internal returns (address) {
        // Create the contract using the provided bytecode and salt
        address deployedAddress;
        assembly {
            deployedAddress := create2(0, add(_byteCode, 0x20), mload(_byteCode), _salt)
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
      function getAddress(uint256 _salt,bytes memory _byteCode) public view returns (address)
        {
            // Get a hash concatenating args passed to encodePacked
            bytes32 hash = keccak256(
                abi.encodePacked(
                    bytes1(0xff), // 0
                    address(this), // address of factory contract
                    _salt, // a random salt
                    keccak256(_byteCode) // the wallet contract bytecode
                )
            );
            // Cast last 20 bytes of hash to address
            return address(uint160(uint256(hash)));
    }

    function verify(address _signer,bytes memory signedMessage, bytes memory _sign) internal pure returns (bool){
        bytes32 messageHash = getMessageHash(signedMessage);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recover(ethSignedMessageHash,_sign) == _signer;
    }

    function getMessageHash(bytes memory signedMessage) public pure returns (bytes32){
        return keccak256(abi.encodePacked((signedMessage)));
    }
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32){
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            _messageHash
        ));
    }

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sign) public pure returns(address){
        (bytes32 r,bytes32 s,uint8 v) = _split(_sign);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _split(bytes memory _sign) internal pure returns(bytes32 r,bytes32 s,uint8 v){
        require(_sign.length==65,"Invalid Signature length");
        assembly{
            r := mload(add(_sign,32))
            s := mload(add(_sign,64))
            v := byte(0,mload(add(_sign,96)))
        }
    }

}
