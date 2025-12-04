import type { GenerateURL } from "@payloadcms/plugin-cloud-storage/types";

import path from "path";

interface Args {
  baseURL: string;
  containerName: string;
}

export const getGenerateURL =
  ({ baseURL, containerName }: Args): GenerateURL =>
  ({ filename, prefix = "" }) => {
    const blobName = path.posix.join(prefix, filename);
    const url = `${baseURL}/${containerName}/${blobName}`;
    return url;
  };
