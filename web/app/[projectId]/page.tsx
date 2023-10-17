"use client";

import { useState, useEffect } from "react";
import { getDeployTx, getDeployedAddress, getGasEstimate } from "../deploy";
import { request, gql } from 'graphql-request'

export default function Create() {
  const [salt, setSalt] = useState(0);
  const [step, setStep] = useState(1);
  const [deployTx, setDeployTx] = useState<{ to: string; data: string }>();
  const [gas, setGas] = useState<number>();
  const [targetAddress, setTargetAddress] = useState<string>();
  const [userData, setUserData] = useState<Object[]>([]);

  interface Data {
    identity: {
      platform: string;
      identity: string;
      displayName: string | null;
      neighbor: IdentityWithSource[];
    };
  }

  interface IdentityRecord {
    platform: string | null;
    identity: string;
    displayName?: string | null;
    neighbor?: IdentityWithSource[] | null;
  }

  interface IdentityWithSource {
    identity: IdentityRecord;
  }

  useEffect(() => {
    
    const getUserData = async (userAddress : string) => {
      
      const document = gql`
      {
        identity(platform: "ethereum", identity: "${userAddress}") {
          platform
          identity
          displayName
          # Here we perform a 3-depth deep search for this identity's "neighbor".
          neighbor(depth: 3) {
            # sources # Which upstreams provide these connection infos.
            identity {
              platform
              identity
              displayName
            }
          }
        }
      }
      `
      const badgeData : Data = await request('https://relation-service.next.id/graphql/', document);
      setUserData(badgeData.identity.neighbor);
    }

    // using this as a sample. we can use deployer's account once we have a next.id enabled account for testing
    getUserData("0x934b510d4c9103e6a87aef13b816fb080286d649");
    
  });

  //   const { config, error, isError, isLoading: isPreparing } = usePrepareContractWrite({
  //     abi: "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3" ,
  //     enabled: !!bytecode,
  //     functionName: 'performCreate',
  //     address: import.meta.env.VITE_CONTRACT_DEPLOYER_MUMBAI,
  //     args: [0, bytecode],
  // })
  
  const onFileChanged = (event: any) => {
    const file = event.target.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("Processing file");
        const content = JSON.parse(e.target!.result as string);
        const initCode = content.bytecode.object;
        console.log("Parsed initCode");
        setDeployTx(getDeployTx(initCode, salt));
        setStep(2);
        setGas(getGasEstimate(initCode));
        setTargetAddress(getDeployedAddress(initCode, salt));

        // save bytecode to state
        // setBytecode(content.bytecode.object)
        // setUploaded(true)
      };
      reader.readAsText(file);
    } else {
      alert("File must be valid JSON, outputted from forge build.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 2:
        return (
        <div>
          <div>
          <h1> multiple platforms: 
            {
              userData.map((ele : Object) => 
                <div key={ele?.identity}>
                  <p>{JSON.stringify(ele?.identity?.platform)}</p>
                </div>
              )
            }</h1>
          </div>
          <div className="space-y-12">
            <p className="text-xl">
              Contract will be deployed to: {targetAddress}
            </p>
          </div>
        </div>
        );
      default:
        return (
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
                className="w-full rounded-lg border-2 border-[#000000] px-[5rem] py-[2rem] text-center"
              >
                Upload bytecode
              </label>
            </div>
          </form>
        );
    }
  };

  return <div className="mt-24 w-full">{renderStep()}</div>;
}
