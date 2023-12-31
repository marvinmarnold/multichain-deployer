"use client";
/* eslint-disable react/no-unescaped-entities */

import { recordDeployment } from "@/app/actions/recordDeployment";
import { Database } from "@tableland/sdk";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { Circles, TailSpin } from "react-loading-icons";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { IProjectSchema, PROJECTS_TABLE } from "../interfaces/tableland";
import { TARGET_CHAINS } from "../lib";

// enum EState {
//   WAIT_BYTECODE = 'wait_bytecode',
//   WAIT_CHAINS = 'wait_chains',
//   READY_TO_DEPLOY = 'ready_to_deploy',
//   DEPLOYING = 'deploying'
// }

type IProjectPageProps = { project: IProjectSchema };
const db: Database<IProjectSchema> = new Database();
const BYTECODE_REFRESH_MS = 3000;
const RECEIVER_PROVIDER = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_DEPLOYER_RECEIVER_RPC_URL!,
);

const CreateDeployment: FC<IProjectPageProps> = ({ project }) => {
  const router = useRouter();
  const [uploadedInitCode, setUploadedInitCode] = useState<undefined | string>(
    undefined,
  );
  const { address, connector, isConnected } = useAccount();
  const [safeAddress, setSafeAddress] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<string | undefined>(undefined);
  const [deployedAddress, setDeployedAddress] = useState<string | undefined>(
    undefined,
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [hardRefresh, setHardRefresh] = useState(false);
  const intervalRef: MutableRefObject<any> = useRef(null);
  const [selectedChains, setSelectedChains] = useState(new Set());
  // const [state, setState] = useState(EState.WAIT_BYTECODE)
  const initCodeToDeploy =
    uploadedInitCode ?? project.next_init_code ?? undefined;
  const version = project.next_salt + 1;

  const chainIds = JSON.stringify(
    Array.from(selectedChains).map((c: any) => parseInt(c)),
  );
  useEffect(() => {
    setSafeAddress(address);
  }, [address]);

  // Clear loading state when new deployment saved
  useEffect(() => {
    console.log("Version updated");
    setIsDeploying(false);
  }, [version]);

  useEffect(() => {
    if (hardRefresh) {
      router.push(`/${project.id}`);
      router.refresh();
    }
  }, [hardRefresh]);

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
        if (!!newProject.next_init_code)
          setUploadedInitCode(newProject.next_init_code);

        // The value of `project` seems to get stuck to whatever it is when useEffect first mounts
        // This causes an endless loop after the first update
        if (project.next_salt !== newProject.next_salt) {
          setHardRefresh(true);
        }
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

  /*
  TRANSACTIONS
  */
  console.log("initCodeToDeploy: " + initCodeToDeploy);
  console.log("isDeploying: " + isDeploying);
  const enablePrepare =
    !!initCodeToDeploy && Array.from(selectedChains).length > 0;
  console.log("enablePrepare: " + enablePrepare);
  const {
    error,
    config,
    isLoading: isLoadingTx,
    isSuccess: isLoadingTxSuccess,
  } = usePrepareContractWrite({
    enabled: enablePrepare,
    address: process.env.NEXT_PUBLIC_DEPLOYER_SENDER_ADDRESS! as `0x${string}`,
    abi: [
      {
        inputs: [
          {
            internalType: "uint32",
            name: "_destinationDomain",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "_gasAmount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "_recipient",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "_message",
            type: "bytes",
          },
        ],
        name: "dispatch",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "dispatch",
    args: [
      selectedChains.values().next().value,
      2000000,
      process.env.NEXT_PUBLIC_DEPLOYER_RECEIVER_ADDRESS_PADDED!,
      initCodeToDeploy,
    ],
  });
  if (!!error) console.warn(error);
  const { data, write, isLoading: isLoadingWrite } = useContractWrite(config);
  const { isLoading: isContractLoading, isSuccess: writeSuccess } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  useEffect(() => {
    if (writeSuccess) {
      console.log("Returned Data", data);
      setTx(data?.hash);
    }
  }, [writeSuccess, data]);
  console.log("isLoadingTx: " + isLoadingTx);
  console.log("isLoadingWrite: " + isLoadingWrite);

  useEffect(() => {
    const contractAbi = [
      "function getAddress(uint256 _salt, bytes memory _byteCode) public view returns (address)",
    ];

    const getDeploymentAddress = async () => {
      const salt = ethers.BigNumber.from(project.next_salt); // Replace with your salt value
      const byteCode = ethers.utils.arrayify(initCodeToDeploy); // Replace with the bytecode you want to pass
      try {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DEPLOYER_RECEIVER_ADDRESS!,
          contractAbi,
          RECEIVER_PROVIDER,
        );

        const address = await contract.getAddress(salt, byteCode);
        setDeployedAddress(address);
        console.log("Returned address:", address);
      } catch (error) {
        console.error("Error calling getAddress:", error);
      }
    };

    if (!!initCodeToDeploy) {
      getDeploymentAddress();
    }
  }, [initCodeToDeploy]);

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
    !!write && write();
    // const types = ["address", "bytes", "bytes"];
    // const values = [address, "0x", initCodeToDeploy];
    // const message = utils.defaultAbiCoder.encode(types, values);
    // console.log("Deploying with these");
    // console.log(message);
    // setUploadedInitCode(undefined);
    // calculate gas and get predicted address
    // send message to hyperchain
    // clear initCode and update salt
  };

  const renderDeployButton = () => {
    if (!!tx) {
      return (
        <div className="space-y-2">
          <form action={recordDeployment}>
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
              id="deployedAddress"
              name="deployedAddress"
              value={deployedAddress}
            />
            <input
              type="hidden"
              id="createdAtMilis"
              name="createdAtMilis"
              value={new Date().getTime()}
            />
            <input type="hidden" id="tx" name="tx" value={tx} />
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
              Save deployment #{version}
            </button>
          </form>

          <div className="text-xs">
            <p>The following bytecode will be deployed to:</p>
            <code className="break-all">{initCodeToDeploy}</code>
          </div>
        </div>
      );
    } else {
      console.log("isLoadingTx " + isLoadingTx);
      console.log("isDeploying " + isDeploying);
      return (
        <div className="space-y-2">
          {!isLoadingTxSuccess || isContractLoading ? (
            <button className="flex w-full flex-row items-center justify-center rounded-md bg-purple-300 p-6 text-center text-lg">
              <TailSpin className="mr-4 w-8" />
              Processing...
            </button>
          ) : (
            <button
              className="w-full rounded-md bg-purple-900 p-6 text-center text-lg"
              onClick={onDeploy}
            >
              Deploy #{version}-
            </button>
          )}

          <div className="text-xs">
            <p>The following bytecode will be deployed to:</p>
            <code className="break-all">{initCodeToDeploy}</code>
          </div>
        </div>
      );
    }
  };

  const sampleRequestJson = JSON.stringify({ key: project.id, bytecode: "%s" });

  if (!safeAddress) return null;
  return (
    <div>
      <p className="text-center text-2xl">Deploy Contract</p>
      <p className="text-center text-sm">version {version}</p>
      {isDeploying && !!tx ? (
        <div className="flex flex-row items-center justify-center justify-items-center">
          <Circles className="mr-4 w-16" />
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
            <p className="my-2 text-center text-xl">OR</p>
            <form>
              <div className="flex flex-col items-center space-y-4">
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
          <li>Deploy {deployedAddress ? `to ${deployedAddress}` : null}</li>
          {enablePrepare ? (
            renderDeployButton()
          ) : (
            <button className="flex w-full cursor-not-allowed flex-row justify-center rounded-md bg-purple-300 p-6 text-lg">
              <TailSpin className="mr-4 w-8" /> Waiting on bytecode and
              chains...
            </button>
          )}
        </ol>
      )}
    </div>
  );
};

export default CreateDeployment;
