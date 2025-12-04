import { tenantContentEditorFieldAccess } from "../access";
import { createUnnamedTenantTab } from "./createTenantTab";
import { link } from "@/fields/link";

export const tenantFooterTab = createUnnamedTenantTab({
  access: tenantContentEditorFieldAccess,
  label: "Footer",
  fields: [
    {
      name: "footerNavItems",
      type: "array",
      fields: [
        link({
          appearances: false,
          tenantCollection: true,
        }),
      ],
      maxRows: 9,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "@/components/Tenant/RowLabel#RowLabel",
        },
      },
    },
  ],
});
