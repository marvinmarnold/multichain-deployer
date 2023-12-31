export interface IProjectSchema {
  id: string;
  name: string;
  next_init_code: string;
  next_salt: number;
}

export interface IDeploymentSchema {
  id: string;
  project_id: string;
  deployed_address: string;
  deployed_by: string;
  deployment_salt: number;
  created_at_milis: number;
  chain_ids: number[];
  tx: string;
}

export const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
export const DEPLOYMENTS_TABLE =
  process.env.NEXT_PUBLIC_TABLELAND_DEPLOYMENTS_TABLE!;
