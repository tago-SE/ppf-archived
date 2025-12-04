import type { ArrayField } from "payload";
import { entraGroupFields } from "./entraGroupFields";

export const tenantAdminField: ArrayField = {
  name: "editorGroups",
  label: "Editor Groups",
  type: "array",
  maxRows: 1,
  admin: {
    description:
      "Select the Azure Entra Group you would like to grant tenant access rights.",
    components: {
      RowLabel: {
        path: "@/components/shared/ArrayFieldTitle#default",
        clientProps: {
          fieldPath: ["name"],
        },
      },
    },
  },
  fields: [entraGroupFields.objectId, entraGroupFields.name],
};
