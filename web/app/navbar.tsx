"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Navbar() {
  const { address, connector, isConnected } = useAccount();
  const [displayAddress, setDisplayAddress] = useState<`0x${string}`>();

  useEffect(() => {
    setDisplayAddress(address);
  }, [address]);

  console.log("is connected " + isConnected);
  console.log("is address " + address);

  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <a
        href="/"
        className="fixed left-0 top-0 flex w-full justify-center  bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl  dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
      >
        Multichain Deploy
      </a>
      <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        {displayAddress}
      </div>
    </div>
  );
}
