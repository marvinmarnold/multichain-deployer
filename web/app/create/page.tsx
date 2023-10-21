"use client";

import { createProject } from "@/app/actions/createProject";
import { useState } from "react";

export default function Create() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (event: any) => {
    setIsSubmitting(true);
  };

  return (
    <div className="w-full">
      <p>Create new project</p>
      <form action={createProject} onSubmit={onSubmit}>
        <div className="flex flex-col space-y-4">
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
            <button disabled className="rounded-md bg-purple-900 px-6 py-6">
              Saving project onchain with Tableland...
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-purple-300 px-6 py-6"
            >
              Create project
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
