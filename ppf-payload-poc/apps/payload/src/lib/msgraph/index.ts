import {
  Client as MsGraphClient,
  GraphError,
} from "@microsoft/microsoft-graph-client";
import { createGraphClient } from "./createGraphClient";
import { withNodeCache } from "../utils/cache/node_cache"

const CACHE_REVALIDATION_IN_SECONDS = 60;
const FIND_GROUP_BY_ID_CACHE_KEY = "graph:groups";
const USER_GROUPS_CACHE_KEY = "graph:user:groups";
const SERVICEPRINCIPAL_GROUPS_CACHE_KEY = "graph:sp:groups";

let client: MsGraphClient | undefined = undefined;
const clientInstance = () => {
  if (!client) {
    client = createGraphClient()!;
  }
  return client;
};

type GraphGroupDataObject = {
  id: string;
  displayName: string;
  description: string | null;
};

export type GraphGroup = {
  displayName: string;
  objectId: string;
  description: string | null;
};

const toGraphGroup = (input: GraphGroupDataObject): GraphGroup => ({
  objectId: input.id,
  displayName: input.displayName,
  description: input.description,
});

const _findGraphGroupById = async (
  groupId: string
): Promise<GraphGroup | undefined> => {
  try {
    const group = await clientInstance()
      .api(`/groups/${groupId}`)
      .select("id,displayName,description")
      .get()
      .then(toGraphGroup);
    return group;
  } catch (error) {
    if ((error as GraphError)?.statusCode == 404) {
      return undefined;
    }
    throw error;
  }
};

/**
 * Find group by Group matching identifier.
 *
 * @param groupId
 * @throws {GraphError} for all request failures except 404
 */
export const findGraphGroupById = (groupId: string) => {
  return withNodeCache(
    _findGraphGroupById,
    [FIND_GROUP_BY_ID_CACHE_KEY, groupId],
    {
      revalidate: CACHE_REVALIDATION_IN_SECONDS,
      tags: [FIND_GROUP_BY_ID_CACHE_KEY, groupId],
    }
  )(groupId);
};

async function _fetchServicePrincipalGroups(sub: string) {
  try {
    // required claims: Application.Read.All, User.Read.All
    const url = `/servicePrincipals/${sub}/transitiveMemberOf/microsoft.graph.group`;
    let groups: GraphGroup[] = [];
    let nextLink: string | null = url;
    while (nextLink) {
      const response = await clientInstance()
        .api(nextLink)
        .select("id,displayName")
        .get();
      if (response?.value) {
        groups = groups.concat(response.value.map(toGraphGroup));
      }
      nextLink = response["@odata.nextLink"] || null;
    }
    return groups;
  } catch (error) {
    throw error;
  }
}

export function getServicePrincipalGroups(sub: string) {
  return withNodeCache(
    _fetchServicePrincipalGroups,
    [SERVICEPRINCIPAL_GROUPS_CACHE_KEY, sub],
    {
      revalidate: CACHE_REVALIDATION_IN_SECONDS,
      tags: [SERVICEPRINCIPAL_GROUPS_CACHE_KEY, sub],
    }
  )(sub);
}

async function  _fetchEntraUserGroups(identifier: string) {
  try {
    // required claims: Application.Read.All, User.Read.All
    const url = `/users/${identifier}/transitiveMemberOf/microsoft.graph.group`;
    let groups: GraphGroup[] = [];
    let nextLink: string | null = url;
    while (nextLink) {
      const response = await clientInstance()
        .api(nextLink)
        .select("id,displayName")
        .get();
      if (response?.value) {
        groups = groups.concat(response.value.map(toGraphGroup));
      }
      nextLink = response["@odata.nextLink"] || null;
    }
    return groups;
  } catch (error) {
    throw error;
  }
}

/**
 * @param identifier oid or email claim
 */
export function getUserGroups(identifier: string) {
  return withNodeCache(
    _fetchEntraUserGroups,
    [USER_GROUPS_CACHE_KEY, identifier],
    {
      revalidate: CACHE_REVALIDATION_IN_SECONDS,
      tags: [USER_GROUPS_CACHE_KEY, identifier],
    }
  )(identifier);
}

/**
 * Checks if a user or service is a member of a group and returns boolean result.

 * @param identifier The principal of the target. Should be ObjectId (oid) for both `user´ and `service´, or optionally email`user´ type.
 * @param userType Required target user type, either `user´ or `service´
 * @throws {GraphError}
 */
export const isUserMemberOfGraphGroup = async (
  identifier: string,
  groupId: string
) => {
  return getUserGroups(identifier).then((groups) =>
    groups.some((g) => g.objectId == groupId)
  );
};

export const MSGraphService = {
  findGraphGroupById,
  isUserMemberOfGraphGroup,
  getServicePrincipalGroups,
  getUserGroups,
};
