// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./IMailbox.sol";
import "./IInterchainGasPaymaster.sol";

contract HyperlaneMessageSender {
    IMailbox outbox;
    IInterchainGasPaymaster igp;

    // Supported Chains
    mapping(uint32 => bool) public supportedChains;

    // Events
    event DispatchMessage(
        uint32 destinationDomains,
        bytes32 recipient,
        bytes message
    );

    event DispatchMessageForMultipleChains(
        uint32[] destinationDomains,
        bytes32 recipient,
        bytes message
    );

    // Errors
    error InsufficientGas(uint256 required, uint256 provided);
    error DifferentLengthArrays(uint256 lenDomains, uint256 lenGasAmounts);
    error InvalidAddress(address addr);

    constructor(address _outbox, address _gasPayer) {
        if (_outbox == address(0)) {
            revert InvalidAddress(_outbox);
        }
        if (_gasPayer == address(0)) {
            revert InvalidAddress(_gasPayer);
        }

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
            revert DifferentLengthArrays(
                _destinationDomain.length,
                _gasAmount.length
            );
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
        bytes calldata _message
    ) external payable {
        uint256 requiredGas = igp.quoteGasPayment(
            _destinationDomain,
            _gasAmount
        );

        if (requiredGas > msg.value) {
            revert InsufficientGas(requiredGas, msg.value);
        }

        bytes32 messageId = outbox.dispatch(
            _destinationDomain,
            _recipient,
            _message
        );
        igp.payForGas{value: msg.value}(
            messageId, // The ID of the message that was just dispatched
            _destinationDomain, // The destination domain of the message
            _gasAmount, // 100k gas to use in the recipient's handle function
            msg.sender // refunds go to msg.sender, who paid the msg.value
        );
        emit DispatchMessage(_destinationDomain, _recipient, _message);
    }

    function dispatchForMultipleChains(
        uint32[] calldata _destinationDomain,
        uint256[] calldata _gasAmount,
        bytes32 _recipient,
        bytes calldata _message
    ) external payable {
        if (_destinationDomain.length != _gasAmount.length) {
            revert DifferentLengthArrays(
                _destinationDomain.length,
                _gasAmount.length
            );
        }

        uint256 totalRequiredGas = 0;
        uint256[] memory gasAmountAfterQuote = new uint256[](
            _destinationDomain.length
        );
        for (uint256 i = 0; i < _destinationDomain.length; i++) {
            gasAmountAfterQuote[i] = igp.quoteGasPayment(
                _destinationDomain[i],
                _gasAmount[i]
            );
            totalRequiredGas += gasAmountAfterQuote[i];
        }

        if (totalRequiredGas > msg.value) {
            revert InsufficientGas(totalRequiredGas, msg.value);
        }

        for (uint256 i = 0; i < _destinationDomain.length; i++) {
            bytes32 messageId = outbox.dispatch(
                _destinationDomain[i],
                _recipient,
                _message
            );
            igp.payForGas{value: gasAmountAfterQuote[i]}(
                messageId, // The ID of the message that was just dispatched
                _destinationDomain[i], // The destination domain of the message
                _gasAmount[i], // 100k gas to use in the recipient's handle function
                msg.sender // refunds go to msg.sender, who paid the msg.value
            );
        }
        emit DispatchMessageForMultipleChains(
            _destinationDomain,
            _recipient,
            _message
        );
    }
}
