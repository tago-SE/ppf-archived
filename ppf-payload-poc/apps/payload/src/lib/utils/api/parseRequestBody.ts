import { ApiError } from "next/dist/server/api-utils";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { CustomApiError } from "./formatApiErrorResponse";

interface RequestBodyParseOptions<T> {
  /**
   * Set to true if the body is optional
   */
  isOptional?: boolean;
  /**
   * Body validation schema which it will try to parse if present
   */
  validation?: z.ZodSchema<T>;
}

export async function parseRequestBodyThrows<T>(
  req: NextRequest,
  options?: RequestBodyParseOptions<T>
) {
  const body = await req.json();
  if (!body && !options?.isOptional) {
    throw new ApiError(400, "Request body is required");
  }
  if (options?.validation) {
    const { success, data, error } = options.validation.safeParse(body);
    if (success) {
      return data;
    }
    throw new CustomApiError(400, "Request body validation error", error);
  }
  return body as T;
}
