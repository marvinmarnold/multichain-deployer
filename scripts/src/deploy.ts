import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Create2Factory } from "./create2factory.js";
import Counter from "../../contracts/out/Counter.sol/Counter.json" assert { type: "json" };

dotenv.config();

console.log("Starting deployment...");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const deployerSigner = new ethers.Wallet(
  process.env.USER_DEPLOYER_SK!,
  provider
);

const deployer = new Create2Factory(provider, deployerSigner);
console.log("Instantiated deployer");

const initCode = Counter.bytecode.object;
const salt = 0;
const gasLimit = "estimate";
await deployer.deploy(initCode, salt, gasLimit);
console.log("FInished deploying");
