import { Database } from "@tableland/sdk";
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
  console.log(project);

  const { results: deploymentResults } = await deploymentDb
    .prepare(
      `SELECT * FROM ${DEPLOYMENTS_TABLE} WHERE project_id = '${params.projectId}' ORDER BY deployment_salt desc;`,
    )
    .all();

  console.log(deploymentResults);
  return (
    <div className="mt-24 w-full space-y-6">
      {!!project ? (
        <>
          <ProjectInfo project={project} />
          <CreateDeployment project={project} />
          <Deployments deployments={deploymentResults} />{" "}
        </>
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
}
