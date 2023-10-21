"use client";

import { createProject } from "@/app/actions/createProject";
import { useState } from "react";
import { TailSpin } from "react-loading-icons";

export default function Create() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (event: any) => {
    setIsSubmitting(true);
  };

  return (
    <div className="mt-20 w-full space-y-10 lg:max-w-5xl">
      <p className="font-serif text-2xl">Create new project</p>
      <form action={createProject} onSubmit={onSubmit}>
        <div className="flex flex-col space-y-6">
          <input
            className="w-full rounded-md px-3 py-6 text-xl text-black"
            type="text"
            placeholder="Project name"
            id="name"
            name="name"
            autoFocus
            required
          />
          {isSubmitting ? (
            <button
              disabled
              className="flex flex-row justify-center rounded-md bg-purple-300 px-6 py-6"
            >
              <TailSpin className="mr-4 w-8" />
              Saving to Filecoin with Tableland...
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-purple-900 px-6 py-6"
            >
              Create project
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
