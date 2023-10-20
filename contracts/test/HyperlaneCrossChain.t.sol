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
    address L2_HLMAILBOX = address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address L1_IGP = address(0xdE86327fBFD04C4eA11dC0F270DA6083534c2582);
    address L2_IGP = address(0xdE86327fBFD04C4eA11dC0F270DA6083534c2582);
    uint32 L1_DOMAIN = 1;
    uint32 L2_DOMAIN = 137;

    uint256 L1_FORK_ID;
    uint256 L2_FORK_ID;

    HyperlaneMessageSender private senderContract;
    HyperlaneMessageReceiver private receiverContract;
    HyperlaneHelper private hyperlaneHelper;

    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    string POLYGON_RPC_URL = vm.envString("POLYGON_RPC_URL");

    // Events
    event ReceivedMessage(uint32 origin, bytes32 sender, bytes message);
    event DispatchMessage(
        uint32 destinationDomains,
        bytes32 recipient,
        bytes message
    );

    function setUp() public {
        owner = address(this);
        user = vm.addr(1);
        addr2 = vm.addr(2);

        L1_FORK_ID = vm.createSelectFork(MAINNET_RPC_URL, 18390698);
        hyperlaneHelper = new HyperlaneHelper();

        L2_FORK_ID = vm.createSelectFork(POLYGON_RPC_URL, 48938901);
        receiverContract = new HyperlaneMessageReceiver();
    }

    // select a specific fork
    function testCrossChain() public {
        vm.selectFork(L1_FORK_ID);
        assertEq(vm.activeFork(), L1_FORK_ID);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(L1_HLMAILBOX, L1_IGP);

        senderContract.addSupportedChain(L1_DOMAIN);
        senderContract.addSupportedChain(L2_DOMAIN);

        vm.stopPrank();

        // vm.deal(user, 10 ether);

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
        emit DispatchMessage(L2_DOMAIN, recipientContract, message);
        vm.recordLogs();
        senderContract.dispatch(L2_DOMAIN, 100000, recipientContract, message);

        // -----------
        vm.expectEmit(true, true, true, true);
        emit ReceivedMessage(
            L1_DOMAIN,
            TypeCasts.addressToBytes32(address(senderContract)),
            message
        );
        Vm.Log[] memory logs = vm.getRecordedLogs();
        hyperlaneHelper.help(L1_HLMAILBOX, L2_HLMAILBOX, L2_FORK_ID, logs);

        vm.selectFork(L2_FORK_ID);
        // assertEq(receiverContract.value(), 12);
    }
}
