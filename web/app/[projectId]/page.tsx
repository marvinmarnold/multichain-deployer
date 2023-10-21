import { Database } from "@tableland/sdk";
import { IProjectSchema } from "../interfaces/tableland";
import CreateDeployment from "./create-deployment";
import ProjectInfo from "./project-info";

const db: Database<IProjectSchema> = new Database();
const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
export const revalidate = 0;

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { results } = await db
    .prepare(
      `SELECT * FROM ${PROJECTS_TABLE} WHERE id = '${params.projectId}';`,
    )
    .all();

  const project = results[0];
  console.log(project);
  return (
    <div className="mt-24 w-full space-y-6">
      <ProjectInfo project={project} />
      <CreateDeployment project={project} />

      <p className="text-center text-2xl">Deployment History</p>
    </div>
  );
}
