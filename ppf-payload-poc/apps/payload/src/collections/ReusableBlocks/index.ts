import { Banner } from "@/blocks/Banner/config";
import { CallToAction } from "@/blocks/CallToAction/config";
import { Code } from "@/blocks/Code/config";
import { Content } from "@/blocks/Content/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { CollectionConfig } from "payload";
import { COLLECTION_SLUG_REUSABLE_BLOCKS } from "../config";
import { beforeDeleteRefCheck } from "../hooks/beforeDeleteRefCheck";
import { updateReferenceTrack } from "../hooks/updateRefs";
import { canCreateCollectionAsync, canMutateCollectionAsync, canReadCollectionAsync } from "../access/defaultCollectionAccess";

export const ReusableBlocks: CollectionConfig = {
  slug: COLLECTION_SLUG_REUSABLE_BLOCKS,
  access: {
    create: canCreateCollectionAsync,
    delete: canMutateCollectionAsync,
    read: canReadCollectionAsync,
    update: canMutateCollectionAsync,
  },
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "content",
      type: "blocks",
      blocks: [Code, Content, MediaBlock, Banner, CallToAction],
    },
  ],
  hooks: {
    afterOperation: [updateReferenceTrack],
    beforeDelete: [beforeDeleteRefCheck],
  },
};

export default ReusableBlocks;