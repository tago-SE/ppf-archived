import { ensureMsGraphGroupExists } from "@/collections/hooks/ensureEntraGroupExists";
import { ensureUniqueFieldInArray } from "@/collections/hooks/ensureUniqueFieldInArray";
import { findGraphGroupById } from "@/lib/msgraph";
import { TextField } from "payload";

export const entraGroupFields = {
  objectId: {
    name: "objectId",
    type: "text",
    label: false,
    required: true,
    defaultValue: "",
    admin: {
      placeholder: "Enter Entra Group ObjectId",
    },
    hooks: {
      beforeValidate: [ensureUniqueFieldInArray, ensureMsGraphGroupExists],
    },
  } as TextField,
  name: {
    name: "name",
    type: "text",
    virtual: true,
    admin: { readOnly: true },
    hooks: {
      afterRead: [
        async ({ value, siblingData, path }) => {
          const { objectId } = siblingData;
          if (objectId) {
            try {
              const graphGroup = await findGraphGroupById(objectId);
              return graphGroup?.displayName;
            } catch (error) {
              // TODO: Perhaps change to throw proper PayloadCMS validation error ?
              console.error(
                `Could not resolve group ${objectId} in path: ${path}`
              );
            }
          }
          return value;
        },
      ],
    },
  } as TextField,
};
