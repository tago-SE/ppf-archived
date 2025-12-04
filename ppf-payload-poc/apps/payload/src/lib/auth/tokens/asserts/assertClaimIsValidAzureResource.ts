import type { JWTPayload } from "jose";
import { z } from "zod";
import { assertClaimWithZodSchemaThrows } from "./assertClaimWithZodSchema";

/**
 * Asserts that the specified claim in the JWT contains a valid Azure subscription string.
 *
 * @param jwt - The JWT payload.
 * @param claim - The claim key to check in the JWT.
 * @param validAzureSubscriptions - An array of valid subscription strings in the expected format.
 * @throws If the claim is missing, the format is invalid, or the extracted value is not in the list of valid subscriptions.
 */
export function assertClaimIsValidAzureResourceThrows(
  jwt: JWTPayload,
  claim: string
) {
  const resourceSchema = z
    .string()
    .refine((val) => /^\/subscriptions\/[^\/]+\/resourcegroups\//.test(val), {
      message:
        'Invalid resource ID format. Expected format: "/subscriptions/{subscription-id}/resourcegroups/{resource-group-name}/.../{app-name}".',
    })
    .transform((val) => {
      const arr = val.split("/").filter((segment) => segment !== "");
      const subscriptionId = arr[1];
      const resourceGroupName = arr[3];
      const appName = arr[arr.length - 1]; 
      return { subscriptionId, resourceGroupName, appName, val };
    })
    .refine((x) => !!x.appName && !!x.resourceGroupName && !!x.subscriptionId)
    .transform((x) => x.val);

  return assertClaimWithZodSchemaThrows(jwt, claim, resourceSchema);
}
