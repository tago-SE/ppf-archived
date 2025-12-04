import type { CollectionConfig } from "payload";
import {
  COLLECTION_GROUP_AUTH,
  COLLECTION_SLUG_SESSIONS,
  COLLECTION_SLUG_USERS,
} from "../config";
import { userAccessCheck } from "../access/user";

export const Sessions: CollectionConfig = {
  slug: COLLECTION_SLUG_SESSIONS,
  admin: {
    hidden: true,
    group: COLLECTION_GROUP_AUTH,
  },
  access: {
    read: userAccessCheck.isAdmin.access,
    create: () => false,
    update: () => false,
    delete: userAccessCheck.isAdmin.access,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: COLLECTION_SLUG_USERS,
      required: true,
      admin: { readOnly: false },
    },
    {
      name: "sessionToken",
      type: "text",
      unique: true,
      index: true,
      required: true,
      admin: { readOnly: false },
    },
    {
      name: "expires",
      type: "date",
      admin: { readOnly: false, date: { pickerAppearance: "default" } },
      required: true,
    },
  ],
} as const;
