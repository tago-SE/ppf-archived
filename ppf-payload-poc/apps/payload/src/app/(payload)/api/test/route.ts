import { NextRequest, NextResponse } from "next/server";
import {
  ApiResponse,
  formatApiResponse,
} from "@/lib/utils/api/formatApiResponse";
import { routeErrorHandler } from "@/lib/utils/api/routeErrorHandler";
import { payloadAuthenticate } from "@/lib/auth/payload/payloadAuthenticate";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { getUserTenantAccessIds } from "@/collections/Users/utils/getTenantAccessIDs";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { user, permissions } = await payloadAuthenticate({
      headers: req.headers,
    });
    return formatApiResponse<any>({ user, permissions }, undefined, 200);
  } catch (error) {
    return routeErrorHandler(error);
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const payload = await getPayloadWithConfig();

    const targetUser = await payload.findByID({
      id: "50300648-fac8-4450-afa8-b99a484e7aba",
      collection: "user",
    });
    const x = targetUser.microsoftGroupIds;
    const tenantIds = getUserTenantAccessIds(targetUser!);
    const users = (
      await payload.find({
        collection: "user",
        where: {
          and: [
            {
              "tenants.tenant": {
                in: tenantIds,
              },
            },
          ],
        },
        pagination: false,
        disableErrors: true,
        overrideAccess: true,
      })
    ).docs.map((u) => u.email);

    const superAdmins = (
      await payload.find({
        collection: "user",
        where: {
          and: [
            {
              microsoftGroupIds: {
                in: [process.env.MSGRAPH_GROUPID_FOR_SUPERADMIN!],
              },
            },
          ],
        },
        pagination: false,
        disableErrors: true,
        overrideAccess: true,
      })
    ).docs.map((u) => u.email);
    return formatApiResponse<any>(
      { tenantIds, users, superAdmins: superAdmins },
      undefined,
      200
    );
  } catch (error) {
    return routeErrorHandler(error);
  }
}
