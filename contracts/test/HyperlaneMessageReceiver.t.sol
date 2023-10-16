// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/HyperlaneMessageReceiver.sol";

contract HyperlaneMessageReceiverTest is Test {
    
    HyperlaneMessageReceiver private mailBox;
    function setUp() public {
        mailBox = new HyperlaneMessageReceiver(address(0x0));
    }
    function testReceive() public {
        // Call the `handle` function and measure gas usage
       
        mailBox.handle(0, 0x000000000000000000000000e12dafe59bc3a996362d54b37dfd2ba9279cad06, bytes("First"));
       

        // Assert your gas usage here or perform any other checks
        // assert(mailBox.lastMessage = bytes32("First"));
    }

}

