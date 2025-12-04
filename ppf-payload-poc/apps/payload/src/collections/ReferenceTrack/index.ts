import { CollectionConfig, PayloadRequest } from "payload";
import { COLLECTION_REFS_TRACK, COLLECTION_SLUG_DYANMIC_PAGE, COLLECTION_SLUG_MEDIA, COLLECTION_SLUG_REUSABLE_BLOCKS } from "../config";
import { isSuperAdmin } from "../access/user";

const isLocalApiCall = (req: PayloadRequest) => {
  console.log(req.payloadAPI)
  return req.payloadAPI === "local";
};

export const ReferenceTrack: CollectionConfig = {
  slug: COLLECTION_REFS_TRACK,
  labels: {
    plural: 'Reference tracking'
  },
  access: {
    create: () => false,
    delete: () => false,
    update: () => false,
  },
  admin: {
    defaultColumns: ["id", "page_ref", "block_ref", "shared_blocks_ref", "media_ref"],
    hideAPIURL: true,
    hidden: ({ user }) => {
      return !isSuperAdmin({
        ...user,
        userType: "user"
      });
    }
  },
  fields: [
    {
      name: "page",
      type: "text",
      index: true,
      admin: {
        hidden: true
      }
    },
    {
      name: "page_ref",
      label: "Page",
      type: "relationship",
      virtual: true,
      relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async (args) => {
            return args.data?.page;
          }
        ]
      }
    },
    {
      name: "block",
      type: "text",
      index: true,
      admin: {
        hidden: true
      }
    },
    {
      name: "block_ref",
      label: "Block",
      type: "relationship",
      virtual: true,
      relationTo: COLLECTION_SLUG_REUSABLE_BLOCKS,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async (args) => {
            return args.data?.block;
          }
        ]
      }
    },
    {
      name: "shared_blocks",
      type: "text",
      index: true,
      hasMany: true,
      admin: {
        hidden: true
      }
    },
    {
      name: "shared_blocks_ref",
      label: "Shared Blocks",
      type: "relationship",
      virtual: true,
      relationTo: COLLECTION_SLUG_REUSABLE_BLOCKS,
      hasMany: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async (args) => {
            return args.data?.shared_blocks ?? [];
          }
        ]
      }
    },
    {
      name: "media",
      type: "text",
      index: true,
      hasMany: true,
      admin: {
        hidden: true
      }
    },
    {
      name: "media_ref",
      label: "Media",
      type: "relationship",
      virtual: true,
      relationTo: COLLECTION_SLUG_MEDIA,
      hasMany: true,
      admin: {
          readOnly: true
      },
      hooks: {
        afterRead: [
          async (args) => {
            return args.data?.media ?? [];
          }
        ]
      }
    },
  ]
};

export default ReferenceTrack;