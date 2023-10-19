"use client";

import { useState, useEffect } from "react";
import { getDeployTx, getDeployedAddress, getGasEstimate } from "../deploy";
import { Data, IdentityRecord, IdentityWithSource, DataSource, Platform } from '../types/nextid';
import Image from 'next/image';
import { unknown, lens, github, ethereum, nextid, space_id, twitter, keybase, reddit, farcaster, sybil, notSybil } from "./imports";
import { element } from "@rainbow-me/rainbowkit/dist/css/reset.css";


export default function Create() {
  const [salt, setSalt] = useState(0);
  const [step, setStep] = useState(1);
  const [deployTx, setDeployTx] = useState<{ to: string; data: string }>();
  const [gas, setGas] = useState<number>();
  const [targetAddress, setTargetAddress] = useState<string>();
  const [identities, setIdentities] = useState<IdentityWithSource[]>([]);
  const walletAddress = "0x934b510d4c9103e6a87aef13b816fb080286d649";

  const convertToVar = (name:string) => {

    if (name == "twitter") return twitter;
    else if (name == "farcaster") return farcaster;
    else if (name == "ethereum") return ethereum;
    else if (name == "lens") return lens;
    else if (name == "keybase") return keybase;
    else if (name == "nextid") return nextid;
    else if (name == "space_id") return space_id;
    else if (name == "reddit") return reddit;
    else if (name == "github") return github;
    else return unknown;

  }

  const sybilCheck = () => {
    let isSybil = 0;
    identities.forEach(identity => {
      identity.sources?.forEach(syb => {
        if (syb === "sybil") {isSybil = 1;}
      })
    });
    return isSybil == 1 ? sybil : notSybil;
  }

  useEffect(() => {

    // make an api request to /api/test to fetch the userdata
    const getIdentities = async () => {
      
      const customerdata = await fetch('/api/nextid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: walletAddress }),
      });
      
      const identities: IdentityWithSource[] = await customerdata.json();
      setIdentities(identities);
      console.log("fetched identities");
      // console.log(identities);
      
    }
    getIdentities();
  }, []);

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
            Sybil: 
            <Image src= { sybilCheck() } height={30} width={30} alt="sybil check" />
            
            <h1> 
              Platforms: 
              {
                identities.map((ele: IdentityWithSource) => 
                  <div key={ele?.identity.uuid}>
                    <div>
                      {/* <p> sources: {JSON.stringify(ele?.sources)} </p> */}
                      {ele?.identity?.platform}
                      <div><Image src= { convertToVar(ele?.identity?.platform) } height={24} width={24} alt="nextIimge" /></div>
                    </div>
                  </div>
                )
              }
            </h1>
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
