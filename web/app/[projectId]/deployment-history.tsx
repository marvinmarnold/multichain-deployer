"use client";

import { FC } from "react";
import { IDeploymentSchema } from "../interfaces/tableland";

type IDeploymentsProps = {
  deployments: IDeploymentSchema[];
};

const Deployment: FC<IDeploymentSchema> = (deployment) => {
  return (
    <tr key={deployment.id}>
      <td>{deployment.deployment_salt + 1}</td>
      <td>{deployment.deployed_by}</td>
      <td>{deployment.deployed_address}</td>
      <td>{deployment.goerli_status}</td>
      <td>{deployment.sepolia_status}</td>
    </tr>
  );
};

const Deployments: FC<IDeploymentsProps> = ({ deployments }) => {
  return (
    <div className="w-full">
      <p className="text-center text-2xl">Deployment History</p>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th>#</th>
            <th>Deployer</th>
            <th>Address</th>
            <th>Goerli</th>
            <th>Sepolia</th>
          </tr>
        </thead>
        <tbody>{deployments.map(Deployment)}</tbody>
      </table>
    </div>
  );
};

export default Deployments;
