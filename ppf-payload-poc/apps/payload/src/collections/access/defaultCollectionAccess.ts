// TODO: Verify and cleanup

// import { getUserTenantAccessIds } from "@/collections/Users/utils/getTenantAccessIDs";
// import type { Access, Where } from "payload";
// import { Media, Page, Tenant } from "@/payload-types";
// import { isPayloadAdminPanel } from "./utils/isPayloadAdminPanel";
// import { getUserTenantPermissions } from "../Tenants/service/getTenantPermissions";
// import { accessChecks } from ".";
// import { isUserAuthenticated } from "./user";
import { SYSTEM_ROLE_SUPERADMIN, TENANT_ROLE_ADMIN } from "../config";
import { TenantRoles } from "../Tenants/service/getTenantPermissions";
import {
  canReadCollectionByTenantAccess,
  makeHasSomeRoleInAnyTenantAccess,
  makeHasTenantRoleInRelatedTenantAccess,
} from "./tenant";

// function getDataTenantId(data: Page | Media | undefined) {
//   if (!data || !data.hasOwnProperty("tenant")) {
//     return "";
//   }
//   if (typeof data.tenant == "string") {
//     return data.tenant;
//   } else {
//     return data.tenant?.id!;
//   }
// }

// const hasAnyTenants: Access = (args) => {
//   const tenants = args.req?.user?.tenants || [];
//   return tenants.length > 0;
// };

// TODO: Maybe should be changed
// See: apps\payload\src\collections\Tenants\access\index.ts
// export const externalReadAccess: Access<Page> = async ({
//   data,
//   id,
//   req,
//   ...rest
// }) => {
//   const dataTenantId = getDataTenantId(data);
//   console.log("DATA", data?.id);
//   console.log("D_TenantId", dataTenantId);
//   const tenantAccessIds = getUserTenantAccessIds(req.user!);
//   const hasTenantAccess = tenantAccessIds.includes(dataTenantId);
//   console.log("userTenantIds", tenantAccessIds);
//   const relatedTenantId =
//     typeof data?.tenant === "string" ? data.tenant : data?.tenant?.id;
//   console.log("RelatedTenantId", relatedTenantId);
//   if (hasTenantAccess) {
//     return true;
//   }
//   const where: Where = {
//     or: [
//       ...tenantAccessIds.map(
//         (tid) =>
//           ({
//             "tenant.id": {
//               equals: tid,
//             },
//           } as Where)
//       ),
//     ],
//   };
//   return where;
// };

// export const adminCollectionReadAccessAsync: Access = async (args) => {
//   const pageTenantId = getDataTenantId(args.data);
//   const tenantAccessIds = getUserTenantAccessIds(args.req.user!);
//   const hasTenantAccess = tenantAccessIds.includes(pageTenantId);
//   return hasTenantAccess || (await accessChecks.user.isAdmin.access(args));
// };

const tenantEditorRoles: TenantRoles = [
  TENANT_ROLE_ADMIN,
  SYSTEM_ROLE_SUPERADMIN,
];

export const canMutateCollectionAsync =
  makeHasTenantRoleInRelatedTenantAccess(tenantEditorRoles);
// const req = args.req;
// if (!req.user) {
//   return false;
// }
// const tenants = args.req.user?.tenants || [];
// const pageTenantId = getDataTenantId(args.data);
// for (let tenant of tenants) {
//   if (typeof tenant == "string") {
//     throw Error("Unexpepcted behaviour in canMutatePage"); // Bug if this happens
//   }
//   if (tenant.id == pageTenantId) {
//     const permissions = getUserTenantPermissions({
//       tenant: tenant as Tenant,
//       user: args.req.user!,
//     });
//     return (
//       permissions.editor || (await accessChecks.user.isAdmin.access(args))
//     ); // shouldn't be necessary
//   }
// }
// return await accessChecks.user.isAdmin.access(args);

export const canCreateCollectionAsync =
  makeHasSomeRoleInAnyTenantAccess(tenantEditorRoles);
// // This just seems wrong
// const hasTenants = await hasAnyTenants(args);
// if (hasTenants) {
//   return true;
// }
// //
// return await accessChecks.user.isAdmin.access(args);

/**
 * Generic access check for common things such as Pages, Media, SharedBlocks, etc...
 * @param args
 * @returns
 */
export const canReadCollectionAsync = canReadCollectionByTenantAccess;
// // when viewing pages inside the admin panel
// // restrict access to the ones your user has access to
// if (isPayloadAdminPanel(args.req)) {
//   console.log("IS APYLOAD ADMIN");
//   return true;
//   return await adminCollectionReadAccessAsync(args);
// }
// // when viewing pages from outside the admin panel
// // you should be able to see your tenants and public tenants
// return await externalReadAccess(args);
