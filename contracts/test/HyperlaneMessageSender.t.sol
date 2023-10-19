// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/HyperlaneMessageSender.sol";

contract HyperlaneMessageSenderTest is Test {
    // the identifiers of the forks
    uint256 mainnetFork;
    uint256 polygonZkFork;

    HyperlaneMessageSender private senderContract;

    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    string POLYGONZK_RPC_URL = vm.envString("POLYGONZK_RPC_URL");

    address mailAddress = address(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    address igpAddress = address(0x6cA0B6D22da47f091B7613223cD4BB03a2d77918);

    function setUp() public {
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

    function testCheckQuote() public {
        vm.selectFork(mainnetFork);
        assertEq(vm.activeFork(), mainnetFork);

        senderContract = new HyperlaneMessageSender(mailAddress, igpAddress);

        uint256 quote = senderContract.getQuote(1, 200000);

        assertGt(quote, 200000, "Quote should be 200000");
    }
}
