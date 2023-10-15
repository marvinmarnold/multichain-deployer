export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <a
          href="/"
          className="fixed left-0 top-0 flex w-full justify-center  bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl  dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        >
          Multichain Deploy
        </a>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"></div>
      </div>

      <div className="mb-32 grid text-left lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2">
        <div className="group rounded-lg border border-transparent px-5 py-4 font-serif transition-colors">
          <p className="text-xl">Deploy anywhere</p>
          <ul className="list-inside list-disc">
            <li>One transaction</li>
            <li>Pay gas with one token on one chain</li>
            <li>Trust deployments with Mask.ID</li>
            <li>Collaborate with a team</li>
          </ul>
        </div>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Get started{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Connect with Mask for coolness
          </p>
        </a>
      </div>
    </main>
  );
}
