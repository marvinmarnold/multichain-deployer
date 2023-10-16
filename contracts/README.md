# MultiChain Deploy Commands

## Deployment

### Goerli 

<code> forge create contracts/HyperlaneMessageReceiver.sol:HyperlaneMessageReceiver --private-key 0xPRIVATE_KEY --rpc-url https://eth-goerli.g.alchemy.com/v2/uhqNkp663kovkM4bEgxGubA8q55vmoV3 --constructor-args 0xCC737a94FecaeC165AbCf12dED095BB13F037685 </code>

Deployed to: 0xe12dafe59bc3a996362d54b37dfd2ba9279cad06

### Seploia
<code> forge create contracts/HyperlaneMessageSender.sol:HyperlaneMessageSender --private-key 0xPRIVATE_KEY --rpc-url https://eth-sepolia.g.alchemy.com/v2/6avqjMpw90GlnkT9Sy9sBAUgFG1bnrxb --constructor-args 0xCC737a94FecaeC165AbCf12dED095BB13F037685 0xF987d7edcb5890cB321437d8145E3D51131298b6 </code>

Deployed to: 0x2Eb8c58f0Df38559e07966BBFD8aBEEcaf49D130

## Interacting 

### Send Message

<b>Destination Address needs to be left padded</b>

<code> cast send --private-key 0xPRIVATE_KEY --rpc-url https://eth-sepolia.g.alchemy.com/v2/6avqjMpw90GlnkT9Sy9sBAUgFG1bnrxb 0x2Eb8c58f0Df38559e07966BBFD8aBEEcaf49D130 "sendString(uint32,bytes32,string)" 5 0x000000000000000000000000e12dafe59bc3a996362d54b37dfd2ba9279cad06 "Nika Nika" --value 0x0000000000000000000000000000000000000000000000000004c8527bfe9d00 </code>

### Call getGasValue
<code >cast call --rpc-url https://eth-sepolia.g.alchemy.com/v2/6avqjMpw90GlnkT9Sy9sBAUgFG1bnrxb 0x2Eb8c58f0Df38559e07966BBFD8aBEEcaf49D130 "getGasValue(uint32,uint256)" 5 47365  </code>


Gas Amount for current receiving contract 47365

## Resources
  <ul>
    <li><a href="https://docs.hyperlane.xyz/docs/resources/addresses">Hyperlane Mailbox and IGP contracts</a></li>
  </ul> 


## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
