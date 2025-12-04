import { buttonVariants } from "@/components/ui/button";
import { getGitApi } from "@/lib/azure-devops-api/getGitApi";
import { page_routes } from "@/lib/routes-config";
import { MoveUpRightIcon, TerminalIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { RepoItem } from "../components/RepoItem";

export default async function Home() {
  const projectName = "private-partner-solutions";
  const repositoryName = "PartnerPortalsPPF";

  async function getRepos() {
    "use server";
    const gitApi = await getGitApi();
    const repos = await gitApi.getRepositories(projectName);
    return Promise.resolve(repos);
  }

  async function getRepo() {
    const gitApi = await getGitApi();
    const repo = await gitApi.getRepository(repositoryName, projectName);
    return repo;
  }

  async function getItem() {
    const gitApi = await getGitApi();
    const item = await gitApi.getItem(
      repositoryName,
      "/wiki/docker/building_docker_images.md",
      projectName
    );
    return item;
  }

  function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  }

  async function getItemContent() {
    const gitApi = await getGitApi();
    const stream = await gitApi.getItemText(
      repositoryName,
      "/wiki/docker/building_docker_images.md",
      projectName
    );
    return streamToString(stream);
  }

  const myRepo = await getRepo();

  const repos = await getRepos();

  const item = await getItem();

  const content = await getItemContent();

  return (
    <div className="flex sm:min-h-[91vh] min-h-[88vh] flex-col items-center justify-center text-center px-2 py-8">
      <Link
        href="https://github.com/nisabmohd/Documentation-Template"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4"
      >
        Follow along on GitHub
        <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
      </Link>
      <h2 className="text-3xl font-bold mb-4 sm:text-7xl">Repo</h2>
      <pre>{JSON.stringify(myRepo, undefined, 4)}</pre>
      <br />
      <h2 className="text-3xl font-bold mb-4 sm:text-7xl">Content</h2>
      <pre>{JSON.stringify(item, undefined, 4)}</pre>
      <br />
      <pre>{content}</pre>
      <br />
      <h2 className="text-3xl font-bold mb-4 sm:text-7xl">Repos</h2>
      {repos.map((repo) => (
        <RepoItem repo={repo} key={repo.id} />
      ))}
      <p className="mb-8 sm:text-xl max-w-[800px] text-muted-foreground">
        This feature-packed documentation template, built with Next.js, offers a
        sleek and responsive design, perfect for all your project documentation
        needs.
      </p>
      <div className="flex flex-row items-center gap-5">
        <Link
          href={`/docs/${page_routes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Stared
        </Link>
        <Link
          href="#"
          className={buttonVariants({
            variant: "outline",
            className: "px-6",
            size: "lg",
          })}
        >
          Customize
        </Link>
      </div>
      <span className="flex flex-row items-center gap-2 text-zinc-400 text-md mt-7 -mb-12 max-[800px]:mb-12">
        <TerminalIcon className="w-4 h-4 mr-1" /> ~ npx this-library-name@latest
      </span>
    </div>
  );
}
