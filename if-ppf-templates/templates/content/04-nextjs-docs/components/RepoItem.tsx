"use client";

import { GitRepository } from "azure-devops-node-api/interfaces/TfvcInterfaces";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, GithubIcon } from "lucide-react";
import React from "react";
import { buttonVariants } from "./ui/button";

interface RepoItemProps {
  repo: GitRepository;
}

export function RepoItem({ repo }: RepoItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="w-full max-w-3xl mb-4 p-4 border border-gray-300 rounded-lg bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">{repo.name}</h2>
        <button
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="flex flex-col mt-2">
          <Link
            href={repo.webUrl as string}
            target="_blank"
            className={buttonVariants({ variant: "secondary", size: "icon" })}
          >
            <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
          </Link>
          <pre className="mt-2 text-left bg-gray-100 p-2 rounded-md overflow-x-auto text-black">
            {JSON.stringify(repo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
