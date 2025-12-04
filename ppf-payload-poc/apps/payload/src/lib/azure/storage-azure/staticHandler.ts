import type { ContainerClient } from "@azure/storage-blob";
import type { StaticHandler } from "@payloadcms/plugin-cloud-storage/types";
import type { CollectionConfig } from "payload";

import { getFilePrefix } from "@payloadcms/plugin-cloud-storage/utilities";
import path from "path";

import { getRangeFromHeader } from "./utils/getRangeFromHeader";

interface Args {
  collection: CollectionConfig;
  getStorageClient: () => ContainerClient;
}

export const getHandler = ({
  collection,
  getStorageClient,
}: Args): StaticHandler => {
  return async (req, { params: { filename } }) => {
    try {
      const prefix = await getFilePrefix({ collection, filename, req });
      const blockBlobClient = getStorageClient().getBlockBlobClient(
        path.posix.join(prefix, filename)
      );
    
      const { end, start } = await getRangeFromHeader(
        blockBlobClient,
        String(req.headers.get("range"))
      );
    
      const blob = await blockBlobClient.download(start, end);
    
      const headers = new Headers();
      if (blob.metadata) {
        Object.entries(blob.metadata).forEach(([key, value]) => {
          headers.append(key, value);
        });
      }
      if (blob.etag) headers.append("ETag", blob.etag);
      if (blob.contentType) headers.append("Content-Type", blob.contentType);
      if (blob.contentLength) headers.append("Content-Length", String(blob.contentLength));
      if (blob.contentRange) headers.append("Content-Range", blob.contentRange);
      if (blob.lastModified) headers.append("Last-Modified", blob.lastModified.toUTCString());
    
      const etagFromHeaders = req.headers.get("etag") || req.headers.get("if-none-match");
      if (etagFromHeaders && etagFromHeaders === blob.etag) {
        return new Response(null, { headers, status: 304 });
      }
    
      const nodeStream = blob.readableStreamBody;
    
      if (!nodeStream) {
        throw new Error("No readable stream body");
      }
    
      const readableStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => {
            try {
              controller.enqueue(new Uint8Array(chunk));
            } catch (err: any) {
              if (err.name === "AbortError") {
                req.payload.logger.warn("Client aborted the request.");
              } else {
                req.payload.logger.error("Stream enqueue error:", err);
              }
            }
          });
    
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          req.payload.logger.warn("ReadableStream canceled: Client aborted the request" + ", file: " + filename + " collection: " + collection.slug);
          // NOTE: Not sure why, but TypeScript is complaining that the destroy method doesn't exist on ReadableStream, even though it does.
          (nodeStream as any).destroy();
        },
      });
    
      return new Response(readableStream, { headers, status: 200 });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        req.payload.logger.warn("Request aborted by the client. No need to log an error.");
      } else {
        req.payload.logger.error("Unhandled error in media stream:", err);
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  };
};
