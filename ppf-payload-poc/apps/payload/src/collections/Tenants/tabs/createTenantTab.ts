import type { Field, FieldBase, NamedTab, UnnamedTab } from "payload";

type CreateNamedTabParams = {
  label: string;
  name: string;
  fields: Field[];
  interfaceName: string;
  access?: NamedTab["access"];
};

function applyTabAccessToField(fields: Field[], access?: NamedTab["access"]) {
  // TODO: There is a issue with Tabs and access not being applied correctly for nested-fields: https://github.com/payloadcms/payload/discussions/2620
  const processedFields =
    access && Object.keys(access).length > 0
      ? fields.map(
          (field) =>
            ({
              ...field,
              access: {
                // Tab-level access applied to top-level fields (defaults)
                ...access,
                // Field-level access (overrides)
                ...(field as FieldBase)?.access,
              },
            } as Field)
        )
      : fields;
  return processedFields;
}
/**
 * Factory function to create a NamedTab with enforced `label`, `name`, and `interfaceName` fields.
 *
 * This was created to enforce that the `label`, `name`, and `interfaceName` are explicitly provided
 * for consistency and clarity in tab configuration for TenantTabs.
 */
export function createNamedTenantTab({
  label,
  name,
  fields,
  interfaceName,
  access,
}: CreateNamedTabParams): NamedTab {
  return {
    label,
    name,
    interfaceName,
    fields: applyTabAccessToField(fields, access),
    // access: access,
  };
}

type CreateUnnamedTabParams = {
  label: string;
  fields: Field[];
  access?: NamedTab["access"];
};

/**
 * Factory function to create a UnnamedTab with enforced `label`, fields and applies top-level field-access if provided.
 * 
 */
export function createUnnamedTenantTab({
  label,
  fields,
  access,
}: CreateUnnamedTabParams): UnnamedTab {
  return {
    label,
    fields: applyTabAccessToField(fields, access),
  };
}
