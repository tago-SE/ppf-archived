import { APIError, CollectionBeforeDeleteHook } from "payload";
import { COLLECTION_REFS_TRACK, COLLECTION_SLUG_MEDIA, COLLECTION_SLUG_REUSABLE_BLOCKS } from "../config";

const lookupMap: Record<string, string> = {
  [COLLECTION_SLUG_REUSABLE_BLOCKS]: 'shared_blocks',
  [COLLECTION_SLUG_MEDIA]: 'media'
}

export const beforeDeleteRefCheck: CollectionBeforeDeleteHook = async ({ req, id, collection }) => {
  const lookupColumn = lookupMap[collection.slug];
  if(!lookupColumn) {
    throw `Coulnd't find lookup column when checking references for ${id}`
  }

  const result = await req.payload.find({
    collection: COLLECTION_REFS_TRACK,
    where: {
      [lookupColumn]: {
        equals: id,
      },
    },
    depth: 0,
  });

  if(result.totalDocs > 0) {
      throw new APIError(`Deletion not allowed. This item is used in content and is still referenced in other documents.`, undefined, undefined, true);
  }
};