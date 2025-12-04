import Logger from "@/lib/logging";
import type { Payload } from "payload";
export type { User } from "@/payload-types";

export type PayloadQueryOptions = { showHiddenFields?: boolean };

export type PayloadAdapterQueryConfigWithOptions =
  PayloadAdapterBaseQueryConfig & {
    options?: PayloadQueryOptions;
  };

export type PayloadAdapterBaseQueryConfig = {
  payload: Payload;
  logger?: Logger;
};