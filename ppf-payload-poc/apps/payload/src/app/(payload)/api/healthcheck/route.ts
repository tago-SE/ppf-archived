import { NextRequest, NextResponse } from "next/server";

import { ApiHealthCheckResponse, ApiStatus } from "@/lib/healthcheck/types";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { ApiHealthCheckHandler } from "@/lib/healthcheck";

const createHealthCheckHandler = () => {
  const handler = new ApiHealthCheckHandler("Partner Portal Framework Apis");
  // TODO: Improve test and add for AzureStorage and MsGraph scopes
  const testDatabase = async () => {
    const payload = await getPayloadWithConfig();
    if (payload.db) {
      await payload.db.count!({ collection: COLLECTION_SLUG_USERS });
      return ApiStatus.Healthy;
    }
    return ApiStatus.Unhealthy;
  };
  handler.addComponent("Database", 10_000, testDatabase);
  return handler;
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiHealthCheckResponse>> {
  const handler = createHealthCheckHandler();
  const result = await handler.execute();
  try {
    return NextResponse.json<ApiHealthCheckResponse>(result, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json<ApiHealthCheckResponse>(result, {
      status: 200,
    });
  }
}
