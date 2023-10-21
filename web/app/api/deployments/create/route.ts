"use server";

import { PROJECTS_TABLE } from "@/app/interfaces/tableland";
import { Database } from "@tableland/sdk";
import { ethers } from "ethers";

const WRITER_SK = process.env.TABLELAND_WRITER_SK!; // Your private key
// To avoid connecting to the browser wallet (locally, port 8545),
// replace the URL with a provider like Alchemy, Infura, Etherscan, etc.
const provider = new ethers.providers.JsonRpcProvider(
  process.env.TABLELAND_RPC_URL,
);
const signer = new ethers.Wallet(WRITER_SK, provider);
// Connect to the database
const db = new Database({ signer });

export async function POST(request: Request) {
  const json = await request.json();
  console.log("got request");
  console.log(json);
  const { meta: setInitCode } = await db
    .prepare(
      `UPDATE ${PROJECTS_TABLE} SET next_init_code = '${json.bytecode}' WHERE id = '${json.key}';`,
    )
    .run();
  console.log(setInitCode.txn);

  return Response.json({ id: "ABC" });
}
