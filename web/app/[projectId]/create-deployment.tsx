"use client";
/* eslint-disable react/no-unescaped-entities */

import { recordDeployment } from "@/app/actions/recordDeployment";
import { utils } from "ethers";
import { Circles, TailSpin } from "react-loading-icons";

import { Database } from "@tableland/sdk";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { IProjectSchema } from "../interfaces/tableland";
import { TARGET_CHAINS } from "../lib";

// enum EState {
//   WAIT_BYTECODE = 'wait_bytecode',
//   WAIT_CHAINS = 'wait_chains',
//   READY_TO_DEPLOY = 'ready_to_deploy',
//   DEPLOYING = 'deploying'
// }

type IProjectPageProps = { project: IProjectSchema };
const db: Database<IProjectSchema> = new Database();
const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
const BYTECODE_REFRESH_MS = 3000;

const CreateDeployment: FC<IProjectPageProps> = ({ project }) => {
  const [uploadedInitCode, setUploadedInitCode] = useState<undefined | string>(
    undefined,
  );
  const { address, connector, isConnected } = useAccount();
  const [safeAddress, setSafeAddress] = useState<string | undefined>(undefined);
  const [isDeploying, setIsDeploying] = useState(false);
  const intervalRef: MutableRefObject<any> = useRef(null);
  const [selectedChains, setSelectedChains] = useState(new Set());
  // const [state, setState] = useState(EState.WAIT_BYTECODE)
  const initCodeToDeploy =
    uploadedInitCode ?? project.next_init_code ?? undefined;

  const chainIds = JSON.stringify(
    Array.from(selectedChains).map((c: any) => parseInt(c)),
  );
  useEffect(() => {
    setSafeAddress(address);
  }, [address]);

  // Poll tableland to see if initcode has been updated
  useEffect(() => {
    // This function fetches the data
    const fetchData = async () => {
      try {
        const { results } = await db
          .prepare(
            `SELECT * FROM ${PROJECTS_TABLE} WHERE id = '${project.id}';`,
          )
          .all();

        if (!results || !results[0]) return;
        const newProject = results[0];
        console.log(newProject);
        if (newProject.next_init_code)
          setUploadedInitCode(newProject.next_init_code);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors as needed
      }
    };

    // Call it once immediately
    if (!initCodeToDeploy) fetchData();

    // Then set up the interval
    intervalRef.current = setInterval(fetchData, BYTECODE_REFRESH_MS); // Polls every second

    // Clean up function to clear the interval
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []); // The empty dependency array means this useEffect runs once when the component mounts, and the cleanup runs when it unmounts

  const chainToggled = (chainId: string) => {
    const newSelections = new Set(selectedChains);
    const wasSelected = selectedChains.has(chainId);
    if (wasSelected) {
      newSelections.delete(chainId);
    } else {
      newSelections.add(chainId);
    }
    setSelectedChains(newSelections);
  };

  const chainSelector = (chainId: string) => {
    const chain = TARGET_CHAINS[chainId];
    const isSelected = selectedChains.has(chainId);
    return (
      <div
        key={chainId}
        onClick={() => chainToggled(chainId)}
        className="cursor-pointer"
      >
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={isSelected}
          readOnly
        />
        <span className="ml-4 text-xl">
          {chain.name} (
          <span className="text-teal-300">
            <a href={`https://chainlist.org/chain/${chainId}`} target="_blank">
              {chainId}
            </a>
          </span>
          )
        </span>
      </div>
    );
  };

  const onFileChanged = (event: any) => {
    const file = event.target.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target!.result as string);
        const initCode = content.bytecode.object;
        // setDeployTx(getDeployTx(initCode, salt));
        // setStep(2);
        // setGas(getGasEstimate(initCode));
        // setTargetAddress(getDeployedAddress(initCode, salt));

        // save bytecode to state
        setUploadedInitCode(content.bytecode.object);
        // setUploaded(true)
      };
      reader.readAsText(file);
    } else {
      alert("File must be valid JSON, outputted from `forge build`.");
    }
  };

  const onDeploy = () => {
    setIsDeploying(true);
    const types = ["address", "bytes", "bytes"];
    const values = [address, "0x", initCodeToDeploy];
    const message = utils.defaultAbiCoder.encode(types, values);
    console.log("Deploying with these");
    console.log(message);
    setUploadedInitCode(undefined);
    // calculate gas and get predicted address
    // send message to hyperchain
    // clear initCode and update salt
  };

  const sampleRequestJson = JSON.stringify({ key: project.id, bytecode: "%s" });

  const WaitBytecode = () => {};

  if (!safeAddress) return null;
  return (
    <div>
      <p className="text-center text-2xl">Deploy Contract</p>
      <p className="text-center text-sm">version {project.next_salt + 1}</p>
      {isDeploying ? (
        <div className="flex flex-row items-center justify-center justify-items-center">
          <Circles className="mr-4 w-8" />
          <span className="text-teal-300">Deploying...</span>
        </div>
      ) : (
        <ol className="list-decimal space-y-6 text-xl">
          <li>
            Build contract locally:{" "}
            <p>
              <code className="text-base">✗ forge build</code>
            </p>
          </li>
          <li>
            Upload from terminal:{" "}
            <pre className="text-base">
              ✗ BYTECODE_PATH=./out/Contract.sol/Contract.json
            </pre>
            <p className="text-base">
              <code>
                ✗ BYTECODE=$(jq -r '.bytecode.object' $BYTECODE_PATH | tr -d
                '\n') printf '{sampleRequestJson}' "$BYTECODE" | curl -XPOST -d
                @- {process.env.NEXT_PUBLIC_API_HOST}/api/deployments/create
              </code>
            </p>
            <p className="my-2 text-xl">OR</p>
            Upload here:
            <form>
              <div className="flex flex-col space-y-4">
                <input
                  id="fileInput"
                  type="file"
                  accept=".json"
                  onChange={onFileChanged}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  className="bg w-1/3 cursor-pointer rounded-lg border-2 border-[#000000] bg-teal-200 py-2 text-center text-base text-black"
                >
                  Upload bytecode
                </label>
              </div>
            </form>
          </li>
          <li>
            <p>Select chains</p>
            {Object.keys(TARGET_CHAINS).map((chainId) =>
              chainSelector(chainId),
            )}
          </li>
          <li>Deploy</li>
          {!!initCodeToDeploy ? (
            <div className="space-y-2">
              <form action={recordDeployment} onSubmit={onDeploy}>
                <input
                  type="hidden"
                  id="projectId"
                  name="projectId"
                  value={project.id}
                />
                <input
                  type="hidden"
                  id="deploymentSalt"
                  name="deploymentSalt"
                  value={project.next_salt}
                />
                <input
                  type="hidden"
                  id="deployedBy"
                  name="deployedBy"
                  value={address}
                />
                <input
                  type="hidden"
                  id="createdAtMilis"
                  name="createdAtMilis"
                  value={new Date().getTime()}
                />
                <input type="hidden" id="tx" name="tx" value={"0xTTT"} />
                <input
                  type="hidden"
                  id="chainIds"
                  name="chainIds"
                  value={chainIds}
                />
                <button
                  className="w-full rounded-md bg-purple-900 p-6 text-center text-lg"
                  type="submit"
                >
                  Deploy #{project.next_salt + 1}
                </button>
              </form>

              <div className="text-xs">
                <p>The following bytecode will be deployed to:</p>
                <code className="break-all">{initCodeToDeploy}</code>
              </div>
            </div>
          ) : (
            <button className="flex w-full cursor-not-allowed flex-row justify-center rounded-md bg-purple-300 p-6 text-lg">
              <TailSpin className="mr-4 w-8" /> Waiting on bytecode...
            </button>
          )}
        </ol>
      )}
    </div>
  );
};

export default CreateDeployment;
