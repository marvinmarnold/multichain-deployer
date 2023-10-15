"use client";

import { ChangeEvent, useState } from "react";
import { TARGET_CHAINS } from "../lib";

export default function Create() {
  const [project, setProject] = useState("");
  const [selectedChains, setSelectedChains] = useState(new Set());
  const [step, setStep] = useState(1);

  const onProjectChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProject(e.currentTarget.value || "");
  };

  const processName = () => {
    if (project.length === 0) return;

    setStep(2);
  };

  const editName = () => {
    setStep(1);
  };

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
      <div key={chainId} onClick={() => chainToggled(chainId)}>
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={isSelected}
          readOnly
        />
        <span className="ml-4 text-xl">
          {chain.name} ({chainId})
        </span>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 2:
        return (
          <div className="space-y-12">
            <p className="text-xl">Select chains to deploy to:</p>
            <div className="space-y-2">
              {Object.keys(TARGET_CHAINS).map((chainId) =>
                chainSelector(chainId),
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <button className="rounded-md bg-purple-300 p-6">
                Create project
              </button>
              <button onClick={editName} className="text-sm text-cyan-400">
                &lt; Edit name ({project})
              </button>
            </div>
          </div>
        );
      default:
        return (
          <form onSubmit={processName}>
            <div className="flex flex-col space-y-4">
              <input
                className="w-full rounded-md px-3 py-6 text-xl text-black"
                type="text"
                value={project}
                placeholder="Project name"
                onChange={onProjectChange}
                autoFocus
              />
              <button
                onClick={processName}
                className="rounded-md bg-purple-300 px-6 py-6"
                type="submit"
              >
                Next &gt;
              </button>
            </div>
          </form>
        );
    }
  };

  return <div className="mt-24 w-full">{renderStep()}</div>;
}
