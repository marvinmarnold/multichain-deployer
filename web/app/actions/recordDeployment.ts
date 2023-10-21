"use server";

import { Database } from "@tableland/sdk";
import { ethers } from "ethers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { DEPLOYMENTS_TABLE, PROJECTS_TABLE } from "../interfaces/tableland";

const WRITER_SK = process.env.TABLELAND_WRITER_SK!; // Your private key
// To avoid connecting to the browser wallet (locally, port 8545),
// replace the URL with a provider like Alchemy, Infura, Etherscan, etc.
const provider = new ethers.providers.JsonRpcProvider(
  process.env.TABLELAND_RPC_URL,
);
const signer = new ethers.Wallet(WRITER_SK, provider);
// Connect to the database
const db = new Database({ signer });

export async function recordDeployment(formData: FormData) {
  console.log("Calling recordDeployment");
  const projectId = formData.get("projectId")?.toString();
  const deploymentSalt = parseInt(
    formData.get("deploymentSalt")?.toString() || "0",
  );
  const createdAtMilis = parseInt(
    formData.get("createdAtMilis")?.toString() || "0",
  );
  console.log("Created at " + createdAtMilis);
  const deployedBy = formData.get("deployedBy")?.toString();
  const tx = formData.get("tx")?.toString();
  const chainIds = formData.get("chainIds")?.toString();

  // projects: increase salt, clear next_init_code
  const { meta: resetProject } = await db
    .prepare(
      `UPDATE ${PROJECTS_TABLE} SET next_init_code = null, next_salt = ${
        deploymentSalt + 1
      } WHERE id = '${projectId}';`,
    )
    .run();

  console.log(resetProject.txn);
  console.log("Reset project");

  const id = uuidv4();

  console.log("id: " + id);
  console.log("projectId: " + projectId);
  console.log("deploymentSalt: " + deploymentSalt);
  console.log("deployedBy: " + deployedBy);
  console.log("createdAtMilis: " + createdAtMilis);
  console.log("tx: " + tx);
  console.log("chainIds: " + chainIds);

  const { meta: insertDeployment } = await db
    .prepare(
      `INSERT INTO ${DEPLOYMENTS_TABLE} (id, project_id, deployment_salt, deployed_address, deployed_by, created_at_milis, tx, chain_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    )
    .bind(
      id,
      projectId,
      deploymentSalt,
      "todo",
      deployedBy,
      createdAtMilis,
      tx,
      chainIds,
    )
    .run();

  console.log(insertDeployment.txn);
  console.log("Recorded deployment");
  revalidatePath(`/${projectId}`);
}
