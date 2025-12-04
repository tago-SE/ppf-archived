import { authenticationField } from "../fields/authentication/authenticationField";
import { tenantAdminField } from "../fields";
import { tenantSecurityFieldAccess } from "../access";
import { createNamedTenantTab } from "./createTenantTab";

export const tenantSecurityTab = createNamedTenantTab({
  label: "Security",
  name: "security",
  interfaceName: "tenantSecurityTab",
  access: tenantSecurityFieldAccess,
  fields: [authenticationField, tenantAdminField],
});
