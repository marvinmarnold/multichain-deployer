"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { EPaths } from "./lib";

export default function Home() {
  const { openConnectModal } = useConnectModal();
  const { address, connector, isConnected } = useAccount();
  const [connectClicked, setConnectClicked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isConnected && connectClicked) redirect(EPaths.CREATE_PROJECT_PAGE);
  }, [isConnected]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const connectWallet = () => {
    setConnectClicked(true);
    openConnectModal && openConnectModal();
  };

  const connectButton = (
    <button
      className="group rounded-lg border border-transparent px-5 py-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      onClick={connectWallet}
    >
      <h2 className={`mb-3 text-2xl font-semibold`}>
        Get started{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
        Connect with a Next.ID enabled wallet for extra trust features.
      </p>
    </button>
  );

  const alreadyConnectedButton = (
    <a
      className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      href={EPaths.CREATE_PROJECT_PAGE}
    >
      <h2 className={`mb-3 text-2xl font-semibold`}>
        Get started{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
        Connect with a Next.ID enabled wallet for extra trust features.
      </p>
    </a>
  );

  return (
    <div className="mb-32 grid text-left lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2">
      <div className="group rounded-lg border border-transparent px-5 py-4 font-serif transition-colors">
        <p className="mb-4 text-xl">Deploy anywhere</p>
        <ul className="list-inside list-disc space-y-2">
          <li>One transaction</li>
          <li>Pay gas with one token on one chain</li>
          <li>Trust deployments with Mask.ID</li>
          <li>Collaborate with a team</li>
        </ul>
      </div>

      {loaded && isConnected ? alreadyConnectedButton : connectButton}
    </div>
  );
}
