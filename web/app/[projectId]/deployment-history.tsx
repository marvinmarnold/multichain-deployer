"use client";

import moment from "moment";
import { FC } from "react";
import { IDeploymentSchema } from "../interfaces/tableland";
import { TARGET_CHAINS } from "../lib";
import NextidBadges from "./nextid-badges";

type IDeploymentsProps = {
  deployments: IDeploymentSchema[];
};

const Deployment: FC<IDeploymentSchema> = (deployment) => {
  const chains = deployment.chain_ids
    .sort()
    .map((chainId) => {
      return TARGET_CHAINS[chainId].name;
    })
    .join(", ");
  return (
    <tr key={deployment.id} className="font-mono">
      <td>{deployment.deployment_salt + 1}</td>
      <td>{moment(deployment.created_at_milis).fromNow()}</td>
      <td>{deployment.deployed_address}</td>
      <td>{deployment.deployed_by}<NextidBadges walletAddress={deployment.deployed_by}/></td>
      <td>{chains}</td>
    </tr>
  );
};

const Deployments: FC<IDeploymentsProps> = ({ deployments }) => {
  return (
    <div className="w-full">
      <p className="text-center text-2xl">Deployment History</p>
      <table className="mt-8 w-full table-auto text-left">
        <thead>
          <tr className="font-serif">
            <th>#</th>
            <th>Deployed at</th>
            <th>Address</th>
            <th>Deployer</th>
            <th>Chains</th>
            <th>Tx</th>
          </tr>
        </thead>
        {!!deployments && deployments.length > 0 ? (
          <tbody>{deployments.map(Deployment)}</tbody>
        ) : null}
      </table>
    </div>
  );
};

export default Deployments;
