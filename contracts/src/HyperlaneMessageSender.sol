// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./interfaces/IMailbox.sol";
import "./interfaces/IInterchainGasPaymaster.sol";

contract HyperlaneMessageSender {
    IMailbox outbox;
    IInterchainGasPaymaster igp;

    // Events
    event SentMessage(
        uint32 destinationDomain,
        bytes32 recipient,
        string message
    );

    // Errors
    error InsufficientGas();
    error DiffrentLengthArrays();

    constructor(address _outbox, address _gasPayer) {
        outbox = IMailbox(_outbox);
        igp = IInterchainGasPaymaster(_gasPayer);
    }

    function getQuote(
        uint32 _destinationDomain,
        uint256 _gasAmount
    ) public view returns (uint256) {
        return igp.quoteGasPayment(_destinationDomain, _gasAmount);
    }

    function getQuoteForMultipleChains(
        uint32[] calldata _destinationDomain,
        uint256[] calldata _gasAmount
    ) public view returns (uint256) {
        if (_destinationDomain.length != _gasAmount.length) {
            revert DiffrentLengthArrays();
        }

        uint256 total = 0;
        for (uint256 i = 0; i < _destinationDomain.length; i++) {
            total += igp.quoteGasPayment(_destinationDomain[i], _gasAmount[i]);
        }
        return total;
    }

    function dispatch(
        uint32 _destinationDomain,
        uint256 _gasAmount,
        bytes32 _recipient,
        string calldata _message
    ) external payable {
        bytes32 messageId = outbox.dispatch(
            _destinationDomain,
            _recipient,
            bytes(_message)
        );
        igp.payForGas{value: msg.value}(
            messageId, // The ID of the message that was just dispatched
            _destinationDomain, // The destination domain of the message
            _gasAmount, // 100k gas to use in the recipient's handle function
            msg.sender // refunds go to msg.sender, who paid the msg.value
        );
        emit SentMessage(_destinationDomain, _recipient, _message);
    }

    function dispatchForMultipleChains(
        uint32[] calldata _destinationDomain,
        uint256[] calldata _gasAmount,
        bytes32 _recipient,
        string calldata _message
    ) external payable {
        if (_destinationDomain.length != _gasAmount.length) {
            revert DiffrentLengthArrays();
        }

        uint256 total = 0;
        for (uint256 i = 0; i < _destinationDomain.length; i++) {
            total += igp.quoteGasPayment(_destinationDomain[i], _gasAmount[i]);
        }

        if (total > msg.value) {
            revert InsufficientGas();
        }

        for (uint256 i = 0; i < _destinationDomain.length; i++) {
            bytes32 messageId = outbox.dispatch(
                _destinationDomain[i],
                _recipient,
                bytes(_message)
            );
            igp.payForGas{value: _gasAmount[i]}(
                messageId, // The ID of the message that was just dispatched
                _destinationDomain[i], // The destination domain of the message
                _gasAmount[i], // 100k gas to use in the recipient's handle function
                msg.sender // refunds go to msg.sender, who paid the msg.value
            );
            emit SentMessage(_destinationDomain[i], _recipient, _message);
        }
    }
}
