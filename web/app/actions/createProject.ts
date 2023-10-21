"use server";

import { Database } from "@tableland/sdk";
import { ethers } from "ethers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { PROJECTS_TABLE } from "../interfaces/tableland";

const WRITER_SK = process.env.TABLELAND_WRITER_SK!; // Your private key
// To avoid connecting to the browser wallet (locally, port 8545),
// replace the URL with a provider like Alchemy, Infura, Etherscan, etc.
const provider = new ethers.providers.JsonRpcProvider(
  process.env.TABLELAND_RPC_URL,
);
const signer = new ethers.Wallet(WRITER_SK, provider);
// Connect to the database
const db = new Database({ signer });

export async function createProject(formData: FormData) {
  console.log("Calling createProject");
  const name = formData.get("name")?.toString();
  const id = uuidv4();
  console.log(`inserting ${id}, ${name}`);
  const { meta: insert } = await db
    .prepare(
      `INSERT INTO ${PROJECTS_TABLE} (id, name, next_salt) VALUES (?, ?, ?);`,
    )
    .bind(id, name, 0)
    .run();

  console.log(insert.txn);
  //   // Wait for transaction finality
  //   await insert.txn?.wait();
  redirect(`/${id}`); // Navigate to new route
}
