// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./IMailbox.sol";
import "./IInterchainGasPaymaster.sol";

contract HyperlaneMessageSender {
    IMailbox outbox;

    IInterchainGasPaymaster igp;
    event SentMessage(uint32 destinationDomain, bytes32 recipient, string message);

    constructor(address _outbox,address _gasPayer) {
        outbox = IMailbox(_outbox);
        igp = IInterchainGasPaymaster(_gasPayer);
    }

    function getGasValue(uint32 _destinationDomain,
        uint256 _gasAmount ) public view returns(uint256){
        return igp.quoteGasPayment(_destinationDomain, _gasAmount);
    }
    
    

    function sendString(
        uint32 _destinationDomain,
        bytes32 _recipient,
        string calldata _message,
        uint256 _gasAmount
    ) external payable {
        bytes32 messageId = outbox.dispatch(_destinationDomain, _recipient, bytes(_message));
        igp.payForGas{ value: msg.value }(
        messageId, // The ID of the message that was just dispatched
        _destinationDomain, // The destination domain of the message
        _gasAmount, // 100k gas to use in the recipient's handle function
        msg.sender // refunds go to msg.sender, who paid the msg.value
    );
    emit SentMessage(_destinationDomain, _recipient, _message);
    }
}
