"use client";

import { recordDeployment } from "@/app/actions/recordDeployment";
import { TailSpin } from "react-loading-icons";

import { Database } from "@tableland/sdk";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { IProjectSchema } from "../interfaces/tableland";

type IProjectPageProps = { project: IProjectSchema };
const db: Database<IProjectSchema> = new Database();
const PROJECTS_TABLE = process.env.NEXT_PUBLIC_TABLELAND_PROJECTS_TABLE!;
const BYTECODE_REFRESH_MS = 3000;

const CreateDeployment: FC<IProjectPageProps> = ({ project }) => {
  const [uploadedInitCode, setUploadedInitCode] = useState<undefined | string>(
    undefined,
  );
  const { address, connector, isConnected } = useAccount();
  const [isDeploying, setIsDeploying] = useState(false);
  const intervalRef: MutableRefObject<any> = useRef(null);
  const initCodeToDeploy =
    uploadedInitCode ?? project.next_init_code ?? undefined;

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
    setUploadedInitCode(undefined);
    // calculate gas and get predicted address
    // send message to hyperchain
    // clear initCode and update salt
  };

  const sampleRequestJson = JSON.stringify({ key: project.id, bytecode: "%s" });

  return (
    <>
      <p className="text-center text-2xl">
        Create Deployment #{project.next_salt + 1}
      </p>
      {isDeploying ? (
        <div>Deploying</div>
      ) : (
        <ol className="list-decimal">
          <li>
            Build contract locally:{" "}
            <p>
              <code>✗ forge build</code>
            </p>
          </li>
          <li>
            Upload from terminal:{" "}
            <pre>✗ BYTECODE_PATH=./out/Contract.sol/Contract.json</pre>
            <p>
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
                  className="bg w-full cursor-pointer rounded-lg border-2 border-[#000000] bg-purple-300 px-[5rem] py-[2rem] text-center"
                >
                  Upload bytecode
                </label>
              </div>
            </form>
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
                <button
                  className="flex flex-row rounded-md bg-purple-300 p-6 text-lg"
                  type="submit"
                >
                  Click to deploy #{project.next_salt + 1}
                </button>
              </form>

              <div className="text-xs">
                <p>The following bytecode will be deployed to:</p>
                <code className="break-all">{initCodeToDeploy}</code>
              </div>
            </div>
          ) : (
            <button className="flex flex-row rounded-md bg-purple-900 p-6 text-lg">
              <TailSpin className="mr-4 w-8" /> Waiting on bytecode...
            </button>
          )}
        </ol>
      )}
    </>
  );
};

export default CreateDeployment;
