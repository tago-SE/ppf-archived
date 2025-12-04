import type { Access, Where } from "payload";
import type {
  AccessCheckerTypes,
  TypedUserOmitCollection as TypedUser,
} from "../types";
import { getUserTenantAccessIds } from "@/collections/Users/utils/getTenantAccessIDs";
import { combinedAccessCheck } from "../combinedAccessCheck";
import { COLLECTION_SLUG_TENANTS } from "@/collections/config";

/**
 * Simple check to see if the user is authenticated
 */
export const isUserAuthenticated = (user: TypedUser | null) =>
  !!user?.id && !!user.principalType;

/**
 * Checks if the user is a CMS User and not a system
 */
export const isUserSignedIn = (user: TypedUser | null) =>
  isUserAuthenticated(user) && user?.userType === "user";

// Try replacing with isSuperAdmin query?
// {
//   and: [
//     {
//       id: {
//         equals: user?.id,
//       },
//     },
//     {
//       microsoftGroupIds: {
//         in: [process.env.MSGRAPH_GROUPID_FOR_SUPERADMIN!],
//       },
//     },
//   ],
// },
export const isSuperAdmin = (
  user: Pick<
    TypedUser,
    "microsoftGroupIds" | "principalType" | "userType"
  > | null
) => {
  return (
    user?.userType == "user" &&
    // NOTE: This may or may not be problematic depending on if we decide to hide the field...
    // May need to use query instead
    (user.microsoftGroupIds || []).includes(
      process.env.MSGRAPH_GROUPID_FOR_SUPERADMIN!
    )
  );
};

const isSelf = (user: TypedUser | null, id: string | number | undefined) =>
  !!user && !!id && user.id === id;

const belongToSameTenantOrSelfAccess: Access<TypedUser> = ({
  id,
  req: { user },
}) => {
  if (!isUserAuthenticated(user)) {
    return false;
  }
  if (isSelf(user, id) || isSuperAdmin(user)) {
    return true;
  }
  const userTenantIds = getUserTenantAccessIds(user!);
  const query: Where = {
    or: [
      {
        [`${COLLECTION_SLUG_TENANTS}.tenant`]: {
          in: userTenantIds,
        },
      },
    ],
  };
  return query;
};

const _pureChecks = {
  isSignedIn: {
    fieldAccess: ({ req }) => isUserSignedIn(req.user),
    access: ({ req }) => isUserSignedIn(req.user),
  } as AccessCheckerTypes,
  isSelf: {
    access: ({ id, req }) => isSelf(req.user, id),
    fieldAccess: ({ id, req }) => isSelf(req.user, id),
  } as AccessCheckerTypes,
  isAdmin: {
    access: ({ req: { user } }) => isSuperAdmin(user),
    fieldAccess: ({ req: { user } }) => isSuperAdmin(user),
  } as AccessCheckerTypes,
  belongToSameTenantOrSelf: {
    access: belongToSameTenantOrSelfAccess,
  } as Pick<AccessCheckerTypes, "access">,
};

const isAdminOrSelf: AccessCheckerTypes = {
  access: combinedAccessCheck.or.access(
    _pureChecks.isAdmin.access,
    _pureChecks.isSelf.access
  ),
  fieldAccess: combinedAccessCheck.or.fieldAccess(
    _pureChecks.isAdmin.fieldAccess,
    _pureChecks.isSelf.fieldAccess
  ),
};

export const userAccessCheck = {
  ..._pureChecks,
  isSignedIn: {
    ..._pureChecks.isSignedIn,
    /**
     * Quick way check if the user is a signed-in CMS Editor
     */
    check: isUserSignedIn,
  },
  isSelf: { ..._pureChecks.isSelf },
  isAdmin: { ..._pureChecks.isAdmin, check: isSuperAdmin },
  isAdminOrSelf,
};
