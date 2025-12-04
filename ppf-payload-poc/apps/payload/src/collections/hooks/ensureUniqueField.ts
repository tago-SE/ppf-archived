import type { CollectionSlug, FieldHook } from "payload";

import { ValidationError } from "payload";

export const ensureUniqueField: FieldHook = async ({
  data,
  originalDoc,
  req,
  value,
  operation,
  schemaPath,
  ...rest
}) => {
  //if (schemaPath.length > 1) {
  //throw new Error(
  //  `schemaPath length was ${schemaPath.length} but expected 1. Logic may need to be changed`
  //);
  //}
  const fieldName = schemaPath[schemaPath.length - 1]; // schemaPath.join(".");
  if (
    operation == "read" ||
    operation == "delete" ||
    (originalDoc && originalDoc[fieldName] === value)
  ) {
    return value;
  }
  const findDuplicateDocs = await req.payload.find({
    collection: rest.collection?.slug as CollectionSlug,
    where: {
      [fieldName]: {
        contains: value,
      },
    },
  });
  for (let docData of findDuplicateDocs.docs) {
    const fieldValue = (docData as any)[fieldName];
    if (
      typeof fieldValue === "string" &&
      fieldValue?.toLowerCase() == value?.toLowerCase()
    ) {
      throw new ValidationError({
        errors: [
          {
            path: fieldValue,
            message: `A ${fieldName} with value '${value}' already exists. Must be unique.`,
          },
        ],
      });
    }
  }
  return value;
};
