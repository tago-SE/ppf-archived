import { User } from "@/payload-types";
import { CurityIdTokenClaims } from "../tokens/curityClaims";
import { AuthProviderName } from "../config/index";
import { z } from "zod";
import {
  AzureManagedIdentityAppClaims,
  EntraIDUserClaims,
  IdType,
} from "../tokens/entraid/EntraIdClaims";
import { CurityClientAccessTokenClaims } from "../tokens/curityClaims";
import { UserPrincipalTypes } from "@/collections/Users/userPrincipalTypes";

export type ParsedProfile = Omit<User, "createdAt" | "updatedAt"> & {
  /**
   * This will be used as the providerAccountId when performing account linking and must be set by the provider.
   * Currently we decided to set it to the profile 'oid' because ManagedIdentity and AzureAd login can share the same in development which allows us to link the users.
   */
  id: string;
  //
};

const extractFamilyName = (
  user: EntraIDUserClaims | CurityIdTokenClaims
): string => {
  if (user.family_name && user.given_name) {
    return `${user.given_name} ${user.family_name}`;
  }
  if (user.name && typeof user.name === "string" && user.name.includes(",")) {
    const [lastName, firstName] = (user.name as string)
      .split(",")
      .map((s) => s.trim());
    return `${firstName} ${lastName}`;
  }
  return user.name as string;
};

export const curityAzureAdProfileToUser = (
  claims: CurityIdTokenClaims
): ParsedProfile => {
  const providerAccountId = claims.oid;
  const parsedUser: ParsedProfile = {
    id: providerAccountId,
    sub: claims.sub,
    oid: claims.oid,
    email: claims.email,
    username: claims.userID,
    microsoftGroupIds: [],
    userType: IdType.User,
    principalType: UserPrincipalTypes.EntraUser,
    linkAccount: {
      provider: AuthProviderName.AzureAd,
      providerAccountId: providerAccountId,
    },
    name: extractFamilyName(claims),
    image: claims.picture,
  };
  return parsedUser;
};

export const curityClientCredentialToUser = (
  claims: CurityClientAccessTokenClaims
): ParsedProfile => {
  const providerAccountId = claims.sub;
  const parsedUser: ParsedProfile = {
    id: providerAccountId,
    sub: claims.sub,
    oid: claims.sub,
    email: `sub-${claims.sub}@${new URL(claims.iss).hostname}`,
    name: "",
    image: "",
    username: "",
    microsoftGroupIds: [],
    userType: IdType.App,
    principalType: UserPrincipalTypes.CurityClient,
    curityClient: {
      clientId: claims.client_id,
      clientPartnerId: claims.client_partner_id,
      iss: claims.iss,
    },
  };
  return parsedUser;
};

function extractResourceDetails(resource: string) {
  // NOTE: Not sure if we can expect all resources to be named acordingly so this logic may need to change
  //Example: /subscriptions/cb50914a-3bbb-4e4a-ae52-9ef078ec2fab/resourcegroups/ppf-portal-pldnet-dev-rg/providers/Microsoft.App/containerApps/ppf-portal-pldnet-dev-ca',
  const schema = z
    .string()
    .refine((val) => /^\/subscriptions\/[^\/]+\/resourcegroups\//.test(val), {
      message:
        'Invalid resource ID format. Expected format: "/subscriptions/{subscription-id}/resourcegroups/{resource-group-name}/.../{app-name}".',
    });
  const arr = schema
    .parse(resource)
    .split("/")
    .filter((segment) => segment !== "");
  const subscriptionId = arr[1];
  const resourceGroupName = arr[3];
  const appName = arr[arr.length - 1];
  return { subscriptionId, resourceGroupName, appName };
}

/**
 * External systems are only authenticated using a access_token from Azure.
 * This function parses that to a PayloadUser which we can store.
 *
 * @param claims
 * @returns
 */
export const azureActiveDirectoryAccessTokenToUser = (
  claims: EntraIDUserClaims | AzureManagedIdentityAppClaims
): ParsedProfile => {
  const idtyp = claims.idtyp;
  if (idtyp === "user") {
    const user: EntraIDUserClaims = claims;
    const parsedUser: ParsedProfile = {
      id: user.oid || user.sub,
      sub: user.sub,
      oid: user.oid,
      userType: IdType.User,
      principalType: UserPrincipalTypes.EntraUser,
      email: z
        .string()
        .email()
        .catch(`oid-${user.oid}@${user.aud.replace("https://", "@")}`)
        .parse(user.upn),
      username: z.string().catch(user.appid).parse(user.upn),
      microsoftGroupIds: user.groups,
      linkAccount: undefined,
      name: extractFamilyName(user),
      image: "",
    };
    return parsedUser;
  }
  if (idtyp === "app") {
    const resource = extractResourceDetails(claims.xms_mirid);
    const app: AzureManagedIdentityAppClaims = claims;
    const parsedApp: ParsedProfile = {
      id: app.appid,
      sub: app.sub,
      oid: app.oid,
      userType: IdType.App,
      principalType: UserPrincipalTypes.EntraServicePrincipal,
      email: z
        .string()
        .email()
        .parse(
          `${resource.appName}.${resource.resourceGroupName}@${resource.subscriptionId}.com`
        ),
      name: "",
      username: resource.appName,
      microsoftGroupIds: app.groups || [],
      linkAccount: undefined,
      image: "",
      // servicePrincipal: {
      //   tenantId: app.tid,
      //   clientId: app.appid,
      //   principalId: app.sub,
      //   xms_az_rid: app.xms_az_rid,
      //   xms_mirid: app.xms_mirid,
      // },
    };
    return parsedApp;
  }
  throw new Error(`Unablee to parse idtyp '${idtyp}'`);
};
