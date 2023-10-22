// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./IMailbox.sol";
import "./IInterchainGasPaymaster.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/utils/Address.sol";

// import "forge-std/console.sol";

contract HyperlaneMessageSender is Ownable {
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
        bytes32[] recipient,
        bytes message
    );

    event DeployedContract(
        address deployer,
        address deployedContract
    );

    // Errors
    error InsufficientGas(uint256 required, uint256 provided);
    error DifferentLengthArrays(uint256 lenDomains, uint256 lenGasAmounts);
    error InvalidAddress(address addr);
    error ChainNotSupported(uint256 chainId);

    constructor(address _outbox, address _gasPayer) Ownable(msg.sender) {
        if (_outbox == address(0)) {
            revert InvalidAddress(_outbox);
        }
        if (_gasPayer == address(0)) {
            revert InvalidAddress(_gasPayer);
        }

        outbox = IMailbox(_outbox);
        igp = IInterchainGasPaymaster(_gasPayer);
    }

    function addSupportedChain(uint32 _chainId) external onlyOwner {
        supportedChains[_chainId] = true;
    }

    function removeSupportedChain(uint32 _chainId) external onlyOwner {
        supportedChains[_chainId] = false;
    }

    function getQuote(
        uint32 _destinationDomain,
        uint256 _gasAmount
    ) public view returns (uint256) {
        if (!supportedChains[_destinationDomain]) {
            revert ChainNotSupported(_destinationDomain);
        }

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
            if (!supportedChains[_destinationDomain[i]]) {
                revert ChainNotSupported(_destinationDomain[i]);
            }
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
        if (!supportedChains[_destinationDomain]) {
            revert ChainNotSupported(_destinationDomain);
        }

        uint256 gasToPay = igp.quoteGasPayment(_destinationDomain, _gasAmount);
        if (gasToPay > msg.value) {
            revert InsufficientGas(gasToPay, msg.value);
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
        bytes32[] calldata _recipient,
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
                _recipient[i],
                _message
            );
            igp.payForGas{value: gasAmountAfterQuote[i]}(
                messageId, // The ID of the message that was just dispatched
                _destinationDomain[i], // The destination domain of the message
                _gasAmount[i], // 100k gas to use in the recipient's handle function
                msg.sender // refunds go to msg.sender, who paid the msg.value
            );
        }

        // deploy onchain
        address senderAddress;
        bytes32 salt;
        bytes memory contractBytecode;

        (senderAddress, salt, contractBytecode) = abi.decode(
            _message,
            (address, bytes32, bytes)
        );
        address deployedContract = deploy(salt, contractBytecode);
        // deploy onchain

        emit DispatchMessageForMultipleChains(
            _destinationDomain,
            _recipient,
            _message
        );
        emit DeployedContract(
            senderAddress,
            deployedContract
        );
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
