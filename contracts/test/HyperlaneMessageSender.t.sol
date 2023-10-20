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
    uint256 polygonFork;

    HyperlaneMessageSender private senderContract;

    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    string POLYGON_RPC_URL = vm.envString("POLYGON_RPC_URL");

    address mailAddress = address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address igpAddress = address(0x6cA0B6D22da47f091B7613223cD4BB03a2d77918);

    function setUp() public {
        owner = address(this);
        addr1 = vm.addr(1);
        addr2 = vm.addr(2);

        mainnetFork = vm.createFork(MAINNET_RPC_URL);
        polygonFork = vm.createFork(POLYGON_RPC_URL);
    }

    function testForkIdDiffer() public view {
        assert(mainnetFork != polygonFork);
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
}
