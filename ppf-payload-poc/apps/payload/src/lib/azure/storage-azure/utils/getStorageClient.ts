import { BlobServiceClient } from "@azure/storage-blob";
import type { ContainerClient } from "@azure/storage-blob";

import type { AzureStorageOptions } from "../index";
import type { TokenCredential } from "@azure/identity";

let storageClient: ContainerClient | null = null;

export function getStorageClient(
  options: Pick<
    AzureStorageOptions,
    "connectionString" | "containerName" | "baseURL"
  >
): ContainerClient {
  if (storageClient) {
    return storageClient;
  }

  const { connectionString: connection, containerName, baseURL } = options;
  let blobServiceClient: BlobServiceClient | undefined = undefined;
  if (typeof connection === "string") {
    blobServiceClient = BlobServiceClient.fromConnectionString(connection);
  } else if (typeof connection === "object") {
    const tokenCredential = connection as TokenCredential;
    blobServiceClient = new BlobServiceClient(baseURL, tokenCredential, {});
  }
  if (!blobServiceClient) {
    throw new Error("connectionString or credential must be provided");
  }
  storageClient = blobServiceClient.getContainerClient(containerName);
  return storageClient;
}
