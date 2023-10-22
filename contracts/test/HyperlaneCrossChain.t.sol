// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/HyperlaneMessageSender.sol";
import "../src/HyperlaneMessageReceiver.sol";
import "./helper/Counter.sol";
import "pigeon/src/hyperlane/HyperlaneHelper.sol";

contract HyperlaneMessageSenderTest is Test {
    address public owner;
    address public user;
    address public addr2;

    address L1_HLMAILBOX = address(0xCC737a94FecaeC165AbCf12dED095BB13F037685); //goerli
    address L2_1_HLMAILBOX =
        address(0xCC737a94FecaeC165AbCf12dED095BB13F037685); //mumbai
    address L2_2_HLMAILBOX =
        address(0xCC737a94FecaeC165AbCf12dED095BB13F037685); //zk

    address L1_IGP = address(0xF90cB82a76492614D07B82a7658917f3aC811Ac1);
    address L2_1_IGP = address(0xF90cB82a76492614D07B82a7658917f3aC811Ac1); //mumbai
    address L2_2_IGP = address(0xF987d7edcb5890cB321437d8145E3D51131298b6); //Sepolia

    uint32 L1_DOMAIN = 5; //Goerli
    uint32 L2_1_DOMAIN = 80001; //mumbai
    uint32 L2_2_DOMAIN = 11155111; //Sepolia

    uint256 L1_FORK_ID;
    uint256 L2_1_FORK_ID;
    uint256 L2_2_FORK_ID;

    HyperlaneMessageSender private senderContract;
    HyperlaneMessageReceiver private receiverContract;
    HyperlaneMessageReceiver private receiverContract2;

    HyperlaneHelper private hyperlaneHelper;

    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    string POLYGON_RPC_URL = vm.envString("POLYGON_RPC_URL");
    string ARBITRUM_RPC_URL = vm.envString("ARBITRUM_RPC_URL");
    string POLYGONZK_RPC_URL = vm.envString("POLYGONZK_RPC_URL");

    // Testnet
    string GOERLI_RPC_URL = vm.envString("GOERLI_RPC_URL");
    string MUMBAI_RPC = vm.envString("MUMBAI_RPC");
    string SEPOLIA_RPC = vm.envString("SEPOLIA_RPC");

    // Events
    event ReceivedMessage(uint32 origin, bytes32 sender, address userAddress);
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

    function setUp() public {
        owner = address(this);
        user = vm.addr(1);
        addr2 = vm.addr(2);

        L1_FORK_ID = vm.createSelectFork(GOERLI_RPC_URL);
        hyperlaneHelper = new HyperlaneHelper();

        L2_2_FORK_ID = vm.createSelectFork(SEPOLIA_RPC);
        receiverContract2 = new HyperlaneMessageReceiver();

        // L2_2_FORK_ID = vm.createSelectFork(ARBITRUM_RPC_URL, 142540691);
        // receiverContract = new HyperlaneMessageReceiver();

        L2_1_FORK_ID = vm.createSelectFork(MUMBAI_RPC);
        receiverContract = new HyperlaneMessageReceiver();
    }

    function testCrossChain() public {
        uint256 GAS_AMOUNT = 100000;

        vm.selectFork(L1_FORK_ID);
        assertEq(vm.activeFork(), L1_FORK_ID);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(L1_HLMAILBOX, L1_IGP);

        senderContract.addSupportedChain(L1_DOMAIN);
        senderContract.addSupportedChain(L2_1_DOMAIN);
        senderContract.addSupportedChain(L2_2_DOMAIN);

        vm.stopPrank();

        vm.deal(address(user), 10 ether);

        // ----------- Gas Quote ------------
        uint256 gasQuote = senderContract.getQuote(L2_1_DOMAIN, GAS_AMOUNT);
        emit log_named_uint("gasQuote", gasQuote);

        // ----------- Contract To Be Deployed On L2 ------------
        bytes memory userContractByteCode = type(Counter).creationCode;
        // ----------- Message (userAddress, bytecode) ------------
        bytes32 salt = bytes32(uint256(keccak256(abi.encodePacked(user))));
        address contractAddressToBeDeployed = senderContract.getAddress(
            salt,
            userContractByteCode
        );
        bytes memory message = abi.encode(user, salt, userContractByteCode);

        // ----------- Dispatch ------------
        bytes32 recipientContract = TypeCasts.addressToBytes32(
            address(receiverContract)
        );

        vm.expectEmit(true, true, true, true);
        emit DispatchMessage(L2_1_DOMAIN, recipientContract, message);
        vm.recordLogs();
        vm.prank(user);
        senderContract.dispatch{value: gasQuote}(
            L2_1_DOMAIN,
            GAS_AMOUNT,
            recipientContract,
            message
        );

        // -----------
        vm.expectEmit(true, true, false, false);
        emit ReceivedMessage(
            L1_DOMAIN,
            TypeCasts.addressToBytes32(address(senderContract)),
            contractAddressToBeDeployed
        );
        Vm.Log[] memory logs = vm.getRecordedLogs();
        hyperlaneHelper.help(L1_HLMAILBOX, L2_1_HLMAILBOX, L2_1_FORK_ID, logs);
    }

    function testCrossMultiChain() public {
        uint256 GAS_AMOUNT = 100000;

        vm.selectFork(L1_FORK_ID);
        assertEq(vm.activeFork(), L1_FORK_ID);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(L1_HLMAILBOX, L1_IGP);

        senderContract.addSupportedChain(L1_DOMAIN);
        senderContract.addSupportedChain(L2_1_DOMAIN);
        senderContract.addSupportedChain(L2_2_DOMAIN);

        vm.stopPrank();

        vm.deal(address(user), 10 ether);

        // ----------- Prepare data ------------
        uint32[] memory allDstDomains = new uint32[](2);
        allDstDomains[0] = L2_1_DOMAIN;
        allDstDomains[1] = L2_2_DOMAIN;

        uint256[] memory allGasAmount = new uint256[](2);
        allGasAmount[0] = GAS_AMOUNT;
        allGasAmount[1] = GAS_AMOUNT;

        bytes32[] memory allReceivers = new bytes32[](2);
        allReceivers[0] = TypeCasts.addressToBytes32(address(receiverContract));
        allReceivers[1] = TypeCasts.addressToBytes32(
            address(receiverContract2)
        );

        address[] memory allDstMailbox = new address[](2);
        allDstMailbox[0] = L2_1_HLMAILBOX;
        allDstMailbox[1] = L2_2_HLMAILBOX;

        uint256[] memory allDstForks = new uint256[](2);
        allDstForks[0] = L2_1_FORK_ID;
        allDstForks[1] = L2_2_FORK_ID;

        // ----------- Gas Quote ------------
        uint256 gasQuote = senderContract.getQuoteForMultipleChains(
            allDstDomains,
            allGasAmount
        );

        gasQuote += GAS_AMOUNT * 2;

        emit log_named_uint("gasQuote", gasQuote);

        // ----------- Contract To Be Deployed On L2 ------------
        bytes memory userContractByteCode = type(Counter).creationCode;

        // ----------- Message (userAddress, salt, bytecode) ------------
        bytes32 salt = bytes32(uint256(keccak256(abi.encodePacked(user))));
        address contractAddressToBeDeployed = senderContract.getAddress(
            salt,
            userContractByteCode
        );
        emit log_named_address(
            "contractAddressToBeDeployed",
            contractAddressToBeDeployed
        );
        bytes memory message = abi.encode(user, salt, userContractByteCode);

        // ----------- Dispatch ------------
        vm.expectEmit(true, true, true, true);
        emit DispatchMessageForMultipleChains(
            allDstDomains,
            allReceivers,
            message
        );
        vm.recordLogs();
        vm.prank(user);
        senderContract.dispatchForMultipleChains{value: gasQuote}(
            allDstDomains,
            allGasAmount,
            allReceivers,
            message
        );

        // -----------
        vm.expectEmit(true, true, false, false);
        emit ReceivedMessage(
            L1_DOMAIN,
            TypeCasts.addressToBytes32(address(senderContract)),
            contractAddressToBeDeployed
        );
        Vm.Log[] memory logs = vm.getRecordedLogs();
        hyperlaneHelper.help(
            L1_HLMAILBOX,
            allDstMailbox,
            allDstDomains,
            allDstForks,
            logs
        );
    }
}
