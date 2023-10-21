"use client";

import { FC } from "react";
import { IProjectSchema } from "../interfaces/tableland";

type IProjectPageProps = {
  project: IProjectSchema;
};

const ProjectInfo: FC<IProjectPageProps> = ({ project }) => {
  return <p className="text-center text-3xl">Project: {project.name}</p>;
};

export default ProjectInfo;
