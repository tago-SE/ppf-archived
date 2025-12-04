import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv, Plugin } from "vite";
import plugin from "@vitejs/plugin-react";
// import fs from "fs";
// import path from "path";
// import child_process from "child_process";
import graphqlLoader from "vite-plugin-graphql-loader";
import codegen from "vite-plugin-graphql-codegen";
import { stripIgnoredCharacters } from "graphql";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { ViteMinifyPlugin } from "vite-plugin-minify";
// import { analyzer } from 'vite-bundle-analyzer'

// const isProduction = process.env.NODE_ENV == "production";

// const baseFolder =
//   process.env.APPDATA !== undefined && process.env.APPDATA !== ""
//     ? `${process.env.APPDATA}/ASP.NET/https`
//     : `${process.env.HOME}/.aspnet/https`;

// const certificateArg = process.argv
//   .map((arg) => arg.match(/--name=(?<value>.+)/i))
//   .filter(Boolean)[0];
// const certificateName = certificateArg
//   ? certificateArg.groups!.value
//   : "dotnet.client";

// if (!certificateName) {
//   console.error(
//     "Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly."
//   );
//   process.exit(-1);
// }

// const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
// const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// if (
//   (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) &&
//   !isProduction
// ) {
//   if (
//     0 !==
//     child_process.spawnSync(
//       "dotnet",
//       [
//         "dev-certs",
//         "https",
//         "--export-path",
//         certFilePath,
//         "--format",
//         "Pem",
//         "--no-password",
//       ],
//       { stdio: "inherit" }
//     ).status
//   ) {
//     throw new Error("Could not create certificate.");
//   }
// }

const extractImportLines = (
  graphqlString: string
): { imports: string; withoutImports: string } => {
  const importLines =
    graphqlString.match(/^#import\s+["'][^"']+["']\s*$/gm) || [];
  const withoutImports = graphqlString
    .replace(/^#import\s+["'][^"']+["']\s*$/gm, "")
    .trim();

  return {
    imports: importLines.join("\n"),
    withoutImports,
  };
};

// This is custom made plugin to minify graphql queries in final bundles. There is really no need for it, just a very small optimization.
// If budnle size is crytical this plugin can save some space.
const gqlMinifyPlugin = (): Plugin => {
  return {
    name: "graphql-source-modifier",
    enforce: "pre",
    transform(code, id) {
      if (id.endsWith(".graphql") || id.endsWith(".gql")) {
        const { imports, withoutImports } = extractImportLines(code);
        const minifiedGql = stripIgnoredCharacters(withoutImports);
        const prefix = imports.trim();
        const newCode =
          prefix.length > 0 ? `${prefix}\n${minifiedGql}` : minifiedGql;
        return {
          code: newCode,
        };
      }
    },
  };
};

const getGraphqlSchemaUrl = (env: Record<string, string>) => {
  const baseUrl = env.SERVER_GRAPHQL_URL;
  if (!baseUrl) {
    throw new Error("Missing environment variable: SERVER_GRAPHQL_URL");
  }
  try {
    // Perhaps the /cms/api/graphql should also be in the .env
    return new URL("/cms/api/graphql", baseUrl).toString();
  } catch {
    throw new Error(`Invalid SERVER_GRAPHQL_URL: ${baseUrl}`);
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "SERVER_");
  const targetProxyUrl = env.SERVER_TARGET_PROXY;
  return {
    plugins: [
      plugin(),
      gqlMinifyPlugin(),
      graphqlLoader(),
      codegen({
        config: {
          schema: getGraphqlSchemaUrl(env), // Replace with your GraphQL API endpoint
          documents: ["src/**/*.graphql"], // Adjust to your GraphQL query/mutation file location
          generates: {
            "src/gql/generated.ts": {
              plugins: ["typescript", "typescript-operations"],
            },
          },
        },
        runOnBuild: false,
      }),
      tailwindcss(),
      ViteImageOptimizer(),
      ViteMinifyPlugin() /*analyzer()*/,
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "^/cms": {
          target: targetProxyUrl,
          secure: false,
        },
      },
      port: 5173,
    },
  };
});
