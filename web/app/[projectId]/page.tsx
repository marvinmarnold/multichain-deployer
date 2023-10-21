import { Database } from "@tableland/sdk";
import { Hearts } from "react-loading-icons";
import {
  DEPLOYMENTS_TABLE,
  IDeploymentSchema,
  IProjectSchema,
} from "../interfaces/tableland";

import CreateDeployment from "./create-deployment";
import Deployments from "./deployment-history";
import ProjectInfo from "./project-info";

const projectDb: Database<IProjectSchema> = new Database();
const deploymentDb: Database<IDeploymentSchema> = new Database();
const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
export const revalidate = 0;

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { results: projectResults } = await projectDb
    .prepare(
      `SELECT * FROM ${PROJECTS_TABLE} WHERE id = '${params.projectId}';`,
    )
    .all();

  const project = projectResults[0];

  const { results: deploymentResults } = await deploymentDb
    .prepare(
      `SELECT * FROM ${DEPLOYMENTS_TABLE} WHERE project_id = '${params.projectId}' ORDER BY deployment_salt desc;`,
    )
    .all();

  return (
    <div className="mt-24 w-full max-w-5xl space-y-6">
      {!!project ? (
        <>
          <ProjectInfo project={project} />
          <CreateDeployment project={project} />
          <Deployments deployments={deploymentResults} />{" "}
        </>
      ) : (
        <div className="space-y-6 text-center">
          <p className="mt-32 text-xl">Loading...</p>
          <Hearts className="mr-4 w-32" />
          <p className="text-teal-300">Please refresh now.</p>
        </div>
      )}
    </div>
  );
}
