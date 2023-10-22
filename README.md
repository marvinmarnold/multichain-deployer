# Multichain-Deployer

Deploy your EVM contract to multiple blockchains.

- Pay in one token, on one chain.
- Get the same deployed address on every chain.
- View your deployment history in one place.
- Collaborate with teammates

## Deployed addresses

### Deployment history

Two Tableland tables are maintained of Filecoin mainnet to store deployment state.

- [Filecoin](https://filfox.info/en/address/0x8Aab328aF3615e2D39aB67BB10667a6924c36F46?t=0) with those contracts.

### Hyperlane deployers

We have deployer sender and receiver contracts on each of these chains. These contracts are responsible for deployment.

- Scroll Sepolia: [Sender](https://sepolia.scrollscan.dev/address/0xD96eD5D45bA2A5f846605f6cC250DEAc244B99D4), [Receiver](https://sepolia.scrollscan.dev/address/0x4374db7ef1a32cef53ab81cb31eac65f89b5f2e1)
- Polygon ZK Testnet: [Sender](https://testnet-zkevm.polygonscan.com/address/0x4374db7ef1a32cef53ab81cb31eac65f89b5f2e1), [Receiver](https://testnet-zkevm.polygonscan.com/address/0xd96ed5d45ba2a5f846605f6cc250deac244b99d4)
- Mantle: [Sender](https://explorer.testnet.mantle.xyz/address/0xD96eD5D45bA2A5f846605f6cC250DEAc244B99D4), [Receiver](https://explorer.testnet.mantle.xyz/address/0x4374db7eF1A32Cef53AB81CB31eAC65f89B5F2e1)
- Goerli: [Sender](https://goerli.etherscan.io/address/0xe8eF7441F86C515387CC5415289C8F547803058d), [Receiver](https://goerli.etherscan.io/address/0x2040bd5940831b2f88740a0967758876b829e538)
- Sepolia: [Sender](https://sepolia.etherscan.io/address/0xe8eF7441F86C515387CC5415289C8F547803058d), [Receiver](https://sepolia.etherscan.io/address/0x2040bd5940831b2f88740a0967758876b829e538)
- Mumbai: [Sender](https://mumbai.polygonscan.com/address/0xe8eF7441F86C515387CC5415289C8F547803058d), [Receiver](https://mumbai.polygonscan.com/address/0x2040bd5940831b2f88740a0967758876b829e538)

## Quickstart

```
# Get code
$ git pull origin https://github.com/marvinmarnold/multichain-deployer
$ cd multichain-deployer
$ git submodule update --init --recursive
```

## Adding a new chain

- Add to web -> TARGET_CHAINS

##

tableland list --chain filecoin --providerUrl https://rpc.ankr.com/filecoin
