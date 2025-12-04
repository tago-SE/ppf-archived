import type { CollectionConfig } from "payload";
import { COLLECTION_SLUG_TENANTS } from "../config";
import { mutateTenant, readTenant } from "./access";
import { accessChecks } from "../access";
import {
  tenantSecurityTab,
  tenantGeneralTab,
  tenantFooterTab,
  tenantHeaderTab,
} from "./tabs";

export const Tenants: CollectionConfig = {
  slug: COLLECTION_SLUG_TENANTS,
  access: {
    create: accessChecks.user.isAdmin.access,
    delete: accessChecks.user.isAdmin.access,
    read: readTenant,
    update: mutateTenant,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        tenantGeneralTab,
        tenantSecurityTab,
        tenantHeaderTab,
        tenantFooterTab,
      ],
    },
  ],
};
