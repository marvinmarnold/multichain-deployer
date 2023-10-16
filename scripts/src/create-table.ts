import { Database } from "@tableland/sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

console.log("Starting deployment...");
// Supported chains
// https://docs.tableland.xyz/sdk/#chain-configuration
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.USER_DEPLOYER_SK!, provider);
// // This table has schema: `counter INTEGER PRIMARY KEY`
// const tableName: string = "healthbot_80001_1"; // Our pre-defined health check table

// interface HealthBot {
//   counter: number;
// }

// const db: Database<HealthBot> = new Database();

// // Type is inferred due to `Database` instance definition
// const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all();
// console.log(results);

interface Schema {
  id: number;
  val: string;
}

// Default to grabbing a wallet connection in a browser
const db = new Database<Schema>({ signer });

// This is the table's `prefix`; a custom table value prefixed as part of the table's name
const prefix: string = "test_01";

const { meta: create } = await db
  .prepare(`CREATE TABLE ${prefix} (id integer primary key, val text);`)
  .run();

// The table's `name` is in the format `{prefix}_{chainId}_{tableId}`
const { name } = create.txn!; // e.g., my_sdk_table_80001_311
console.log("Created table");
console.log(create);
