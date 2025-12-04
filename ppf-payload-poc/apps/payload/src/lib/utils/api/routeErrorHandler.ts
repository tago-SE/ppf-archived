import { NextRequest, NextResponse } from "next/server";
import { ErrorResponseBuilder } from "./formatApiErrorResponse";
import { ApiResponse } from "./formatApiResponse";
import { PayloadRequest } from "payload";

export function routeErrorHandler(error: unknown) {
  return new ErrorResponseBuilder().fromError(error).toJsonRespponse();
}

export async function withNextRequestErrorHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest) => {
    return handler(req).catch(routeErrorHandler);
  };
}

export function withPayloadReqErrorHandler(
  handler: (req: PayloadRequest) => Promise<Response>
) {
  return async (req: PayloadRequest) => {
    return handler(req).catch(routeErrorHandler);
  };
}
