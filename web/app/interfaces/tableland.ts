export interface IProjectSchema {
  id: string;
  name: string;
  next_init_code: string;
  next_salt: number;
}

export const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
export const DEPLOYMENTS_TABLE =
  process.env.NEXT_PUBLIC_TABLELAND_DEPLOYMENTS_TABLE!;
