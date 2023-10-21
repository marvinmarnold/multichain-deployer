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

    address L1_HLMAILBOX = address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address L2_1_HLMAILBOX =
        address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address L2_2_HLMAILBOX =
        address(0xDDd979557327455A497B314fbE879e82C63BA563);

    address L1_IGP = address(0x6cA0B6D22da47f091B7613223cD4BB03a2d77918);
    address L2_1_IGP = address(0x6cA0B6D22da47f091B7613223cD4BB03a2d77918);
    address L2_2_IGP = address(0x9C54659D372d9424ef79A9C24d921AB4ee376045);

    uint32 L1_DOMAIN = 1;
    uint32 L2_1_DOMAIN = 137;
    uint32 L2_2_DOMAIN = 42161;

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

    // Events
    event ReceivedMessage(uint32 origin, bytes32 sender, bytes message);
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

        L1_FORK_ID = vm.createSelectFork(MAINNET_RPC_URL, 18390698);
        hyperlaneHelper = new HyperlaneHelper();

        L2_2_FORK_ID = vm.createSelectFork(POLYGONZK_RPC_URL, 6460184);
        receiverContract2 = new HyperlaneMessageReceiver();

        // L2_2_FORK_ID = vm.createSelectFork(ARBITRUM_RPC_URL, 142540691);
        // receiverContract = new HyperlaneMessageReceiver();

        L2_1_FORK_ID = vm.createSelectFork(POLYGON_RPC_URL, 48938901);
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

        vm.stopPrank();

        vm.deal(address(user), 10 ether);

        // ----------- Gas Quote ------------
        uint256 gasQuote = senderContract.getQuote(L2_1_DOMAIN, GAS_AMOUNT);

        // ----------- Contract To Be Deployed On L2 ------------
        Counter counter = new Counter();
        bytes memory userContractByteCode = address(counter).code;

        // ----------- Sign ------------
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            1,
            keccak256(userContractByteCode)
        );

        bytes memory signature = abi.encodePacked(v, r, s);
        // ----------- Message (userAddress, signature, bytecode) ------------

        bytes memory message = abi.encode(
            user,
            signature,
            userContractByteCode
        );

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
        vm.expectEmit(true, true, true, true);
        emit ReceivedMessage(
            L1_DOMAIN,
            TypeCasts.addressToBytes32(address(senderContract)),
            message
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
        uint32[] memory allDstDomains = new uint32[](1);
        allDstDomains[0] = L2_1_DOMAIN;

        uint256[] memory allGasAmount = new uint256[](1);
        allGasAmount[0] = GAS_AMOUNT;

        bytes32[] memory allReceivers = new bytes32[](1);
        allReceivers[0] = TypeCasts.addressToBytes32(address(receiverContract));

        address[] memory allDstMailbox = new address[](1);
        allDstMailbox[0] = L2_1_HLMAILBOX;

        uint256[] memory allDstForks = new uint256[](1);
        allDstForks[0] = L2_1_FORK_ID;

        // ----------- Gas Quote ------------
        uint256 gasQuote = senderContract.getQuoteForMultipleChains(
            allDstDomains,
            allGasAmount
        );

        // ----------- Contract To Be Deployed On L2 ------------
        Counter counter = new Counter();
        bytes memory userContractByteCode = address(counter).code;

        // ----------- Sign ------------
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            1,
            keccak256(userContractByteCode)
        );

        bytes memory signature = abi.encodePacked(v, r, s);
        // ----------- Message (userAddress, signature, bytecode) ------------

        bytes memory message = abi.encode(
            user,
            signature,
            userContractByteCode
        );

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
        vm.expectEmit(true, true, true, true);
        emit ReceivedMessage(
            L1_DOMAIN,
            TypeCasts.addressToBytes32(address(senderContract)),
            message
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

    // function testCrossMultiChainWithTwoChains() public {
    //     uint256 GAS_AMOUNT = 100000;

    //     vm.selectFork(L1_FORK_ID);
    //     assertEq(vm.activeFork(), L1_FORK_ID);

    //     vm.deal(owner, 10 ether);
    //     vm.startPrank(owner);

    //     senderContract = new HyperlaneMessageSender(L1_HLMAILBOX, L1_IGP);

    //     senderContract.addSupportedChain(L1_DOMAIN);
    //     senderContract.addSupportedChain(L2_1_DOMAIN);
    //     senderContract.addSupportedChain(L2_2_DOMAIN);

    //     vm.stopPrank();

    //     vm.deal(address(user), 10 ether);

    //     // ----------- Prepare data ------------
    //     uint32[] memory allDstDomains = new uint32[](2);
    //     allDstDomains[0] = L2_1_DOMAIN;
    //     allDstDomains[1] = L2_2_DOMAIN;

    //     uint256[] memory allGasAmount = new uint256[](2);
    //     allGasAmount[0] = GAS_AMOUNT;
    //     allGasAmount[1] = GAS_AMOUNT;

    //     bytes32[] memory allReceivers = new bytes32[](2);
    //     allReceivers[0] = TypeCasts.addressToBytes32(address(receiverContract));
    //     allReceivers[1] = TypeCasts.addressToBytes32(
    //         address(receiverContract2)
    //     );

    //     address[] memory allDstMailbox = new address[](2);
    //     allDstMailbox[0] = L2_1_HLMAILBOX;
    //     allDstMailbox[1] = L2_2_HLMAILBOX;

    //     uint256[] memory allDstForks = new uint256[](2);
    //     allDstForks[0] = L2_1_FORK_ID;
    //     allDstForks[1] = L2_2_FORK_ID;

    //     // ----------- Gas Quote ------------
    //     uint256 gasQuote = senderContract.getQuoteForMultipleChains(
    //         allDstDomains,
    //         allGasAmount
    //     );

    //     emit log_named_uint("gasQuote", gasQuote);

    //     // ----------- Contract To Be Deployed On L2 ------------
    //     Counter counter = new Counter();
    //     bytes memory userContractByteCode = address(counter).code;

    //     // ----------- Sign ------------
    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(
    //         1,
    //         keccak256(userContractByteCode)
    //     );

    //     bytes memory signature = abi.encodePacked(v, r, s);
    //     // ----------- Message (userAddress, signature, bytecode) ------------

    //     bytes memory message = abi.encode(
    //         user,
    //         signature,
    //         userContractByteCode
    //     );

    //     // ----------- Dispatch ------------
    //     vm.expectEmit(true, true, true, true);
    //     emit DispatchMessageForMultipleChains(
    //         allDstDomains,
    //         allReceivers,
    //         message
    //     );
    //     vm.recordLogs();
    //     vm.prank(user);
    //     senderContract.dispatchForMultipleChains{value: gasQuote}(
    //         allDstDomains,
    //         allGasAmount,
    //         allReceivers,
    //         message
    //     );

    //     // -----------
    //     vm.expectEmit(true, true, true, true);
    //     emit ReceivedMessage(
    //         L1_DOMAIN,
    //         TypeCasts.addressToBytes32(address(senderContract)),
    //         message
    //     );
    //     Vm.Log[] memory logs = vm.getRecordedLogs();
    //     hyperlaneHelper.help(
    //         L1_HLMAILBOX,
    //         allDstMailbox,
    //         allDstDomains,
    //         allDstForks,
    //         logs
    //     );
    // }
}
