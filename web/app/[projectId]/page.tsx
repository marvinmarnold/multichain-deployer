"use client";

import { useState } from "react";
import { getDeployTx, getDeployedAddress, getGasEstimate } from "../deploy";

export default function Create() {
  const [salt, setSalt] = useState(0);
  const [step, setStep] = useState(1);
  const [deployTx, setDeployTx] = useState<{ to: string; data: string }>();
  const [gas, setGas] = useState<number>();
  const [targetAddress, setTargetAddress] = useState<string>();

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
          <div className="space-y-12">
            <p className="text-xl">
              Contract will be deployed to: {targetAddress}
            </p>
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
