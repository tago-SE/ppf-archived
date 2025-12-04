import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { promises as fs } from "fs";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { page_routes } from "./routes-config";
import { visit } from "unist-util-visit";

// custom components imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pre from "@/components/pre";
import { getGitApi } from "./azure-devops-api/getGitApi";
import { GitItem, VersionControlRecursionType } from "azure-devops-node-api/interfaces/GitInterfaces";

type MdxFrontmatter = {
  title: string;
  description: string;
};

// add custom components
const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
};

async function geRepoItemContent(path: string) {
  const gitApi = await getGitApi();

  const stream = await gitApi.getItemText(
    // TODO: Replace Project and Collection to be dynamic
    "PartnerPortalsPPF",
    path,
    "private-partner-solutions"
  );
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export type MenuTreeItem = { name: string, path?: string | null, children?: MenuTreeItem[] }; // okay

const getItemsTree = (arr: GitItem[]) => {
  let result: MenuTreeItem[] = [];
  let level = {result};

  arr.forEach(item => {
    item.path?.replace('/', '').split('/').reduce((r: any, name, i, a) => {
      if(!r[name]) {
        r[name] = {result: []};
        r.result.push({name, children: r[name].result, path: item.path})
      }
      
      return r[name];
    }, level)
  });

  return result;
};

const optimizeTree = (tree: MenuTreeItem[], parent?: MenuTreeItem) => {
  tree.forEach(x => {
    if(x.children && x.children?.length > 0) {
      optimizeTree(x.children, x) as MenuTreeItem[];
    }

    // Optimized path
    if(x.children && x.children.length > 0) {
      x.path = null;
    } else if(x.path) {
      x.path = x.path.replace('.md', '');
    }

    // Merges child with parent
    if(parent && parent.children?.length == 1) {
      parent.name = `${parent.name}/${x.name}`;
      parent.children = x.children;
    }
  });

  return tree;
}

export async function getRepoItemsList() {
  const gitApi = await getGitApi();
  const list = await gitApi.getItems("PartnerPortalsPPF", "private-partner-solutions", "/", VersionControlRecursionType.Full).then(x => x.filter(q => q.path?.endsWith('.md')));
  return optimizeTree(getItemsTree(list));
}

export async function getMarkdownForSlug(slug: string) {
  try {
    // example: /wiki/docker/building_docker_images
    // #Example 1 - Repo markdown
    const contentPath = getContentRepoPath(slug);
    const rawMdx = await geRepoItemContent(contentPath);
    const safeContent = rawMdx.replace(/\{([^\}]+)\}/g, "\\{$1\\}"); // Temp quick-fix due to error in parsing {}
    // #Example 2 - Static markdown
    // const contentPath = getContentFilePath(slug);
    // const rawMdx = await fs.readFile(contentPath, "utf-8");
    return await compileMDX<MdxFrontmatter>({
      source: safeContent,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          rehypePlugins: [
            preProcess,
            rehypeCodeTitles,
            rehypePrism,
            rehypeSlug,
            rehypeAutolinkHeadings,
            postProcess,
          ],
          remarkPlugins: [remarkGfm],
        },
      },
      components,
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * Page anchor navigation
 * @param slug
 */
export async function getTocs(slug: string) {
  // Example 1 - Remote markdown content
  const contentPath = getContentRepoPath(slug);
  const rawMdx = await geRepoItemContent(contentPath);
  // Exampl 2 - File based markdown content
  // const rawMdx = await fs.readFile(contentPath, "utf-8");

  // captures between ## - #### can modify accordingly
  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings = [];
  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    const slug = sluggify(headingText);
    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${slug}`,
    });
  }
  return extractedHeadings;
}

// TODO: Need to be changed to remote tree
export function getPreviousNext(path: string) {
  const index = page_routes.findIndex(({ href }) => href == path);
  return {
    prev: page_routes[index - 1],
    next: page_routes[index + 1],
  };
}

function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, "-");
  return slug.replace(/[^a-z0-9-]/g, "");
}

function getContentRepoPath(slug: string) {
  return "/" + slug + ".md";
}

function getContentFilePath(slug: string) {
  return path.join(process.cwd(), "/contents/docs/", `${slug}.mdx`);
}

// for copying the code
const preProcess = () => (tree: any) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      const [codeEl] = node.children;
      if (codeEl.tagName !== "code") return;
      node.raw = codeEl.children?.[0].value;
    }
  });
};

const postProcess = () => (tree: any) => {
  visit(tree, "element", (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      node.properties["raw"] = node.raw;
    }
  });
};
