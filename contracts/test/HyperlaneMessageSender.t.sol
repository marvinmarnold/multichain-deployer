// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/HyperlaneMessageSender.sol";

contract HyperlaneMessageSenderTest is Test {
    HyperlaneMessageSender private mailBox;

    function setUp() public {
        mailBox = new HyperlaneMessageSender(address(0x0), address(0x0));
    }

    function testReceive() public {}
}
