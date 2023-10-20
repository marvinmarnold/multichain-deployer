// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/HyperlaneMessageSender.sol";
import "./helper/Counter.sol";

contract HyperlaneMessageSenderTest is Test {
    address public owner;
    address public addr1;
    address public addr2;

    uint256 mainnetFork;
    uint256 polygonZkFork;

    HyperlaneMessageSender private senderContract;

    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    string POLYGONZK_RPC_URL = vm.envString("POLYGONZK_RPC_URL");

    address mailAddress = address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address igpAddress = address(0x6cA0B6D22da47f091B7613223cD4BB03a2d77918);

    function setUp() public {
        owner = address(this);
        addr1 = vm.addr(1);
        addr2 = vm.addr(2);

        mainnetFork = vm.createFork(MAINNET_RPC_URL);
        polygonZkFork = vm.createFork(POLYGONZK_RPC_URL);
    }

    function testForkIdDiffer() public view {
        assert(mainnetFork != polygonZkFork);
    }

    // select a specific fork
    function testCanSelectFork() public {
        // select the fork
        vm.selectFork(mainnetFork);
        assertEq(vm.activeFork(), mainnetFork);
    }

    function testSupportedChains() public {
        vm.selectFork(mainnetFork);
        assertEq(vm.activeFork(), mainnetFork);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(mailAddress, igpAddress);

        bytes4 selector = bytes4(keccak256("ChainNotSupported(uint256)"));
        vm.expectRevert(abi.encodeWithSelector(selector, 1));
        senderContract.getQuote(1, 200000);
    }

    function testCheckQuote() public {
        vm.selectFork(mainnetFork);
        assertEq(vm.activeFork(), mainnetFork);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(mailAddress, igpAddress);

        senderContract.addSupportedChain(1);
        senderContract.addSupportedChain(137);

        uint256 quote = senderContract.getQuote(137, 100);
        assertGt(quote, 100, "Quote should be 100");
    }

    function testDispach() public {
        vm.selectFork(mainnetFork);
        assertEq(vm.activeFork(), mainnetFork);

        vm.deal(owner, 10 ether);
        vm.startPrank(owner);

        senderContract = new HyperlaneMessageSender(mailAddress, igpAddress);

        senderContract.addSupportedChain(1);
        senderContract.addSupportedChain(137);

        uint256 quote = senderContract.getQuote(137, 100000);
        assertGt(quote, 100000, "Quote should be 10000");

        Counter counter = new Counter();
        bytes memory userContract = address(counter).code;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, keccak256(userContract));
        bytes memory message = abi.encodePacked(
            addr1,
            abi.encodePacked(r, s, v),
            userContract
        );

        senderContract.dispatch{value: quote}(
            137,
            100000,
            bytes32(uint256(uint160(addr1)) << 96),
            message
        );
    }
}
