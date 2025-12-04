import { COLLECTION_REFS_TRACK, COLLECTION_SLUG_DYANMIC_PAGE, COLLECTION_SLUG_REUSABLE_BLOCKS } from "@/collections/config";
import _ from "lodash";
import { CollectionAfterOperationHook } from "payload";

function findObjectsByProperty<T extends Record<string, any>>(
    obj: T,
    propName: string,
    propValue: any = null,
    path: string = ''
): { path: string; value: any }[] {
    let results: { path: string; value: any }[] = [];
  
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const childPath = `${path}[${i}]`;
        results = results.concat(findObjectsByProperty(obj[i], propName, propValue, childPath));
      }
    } else if (obj && typeof obj === 'object') {
      if (propName in obj && (propValue === null || obj[propName] === propValue)) {
        results.push({ path, value: obj });
      }
  
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const childPath = path ? `${path}.${key}` : key;
          results = results.concat(findObjectsByProperty(obj[key], propName, propValue, childPath));
        }
      }
    }
  
    return results;
}

export const updateReferenceTrack: CollectionAfterOperationHook<any> = async ({
  operation,
  result,
  req: { payload },
  collection
}) => {
  const type = collection.slug == COLLECTION_SLUG_DYANMIC_PAGE ? "page" : collection.slug == COLLECTION_SLUG_REUSABLE_BLOCKS ? "block" : null;

  if(operation === "create" || operation === "update" || operation === "updateByID") {
    if (type === "page" && (!result.layout || result._status !== "published")) {
      return;
    }

    const arraysAreEqual = (arr1: any[], arr2: any[]): boolean => {
      return _.isEqual(_.sortBy(arr1), _.sortBy(arr2));
    };

    const extractIdsFromNestedField = (
      items: { value: { [key: string]: { id?: string } | string } }[],
      key: string
    ): string[] =>
      _.uniq(
        items
          .map(x => (typeof x.value[key] === "string" ? x.value[key] : x.value[key]?.id))
          .filter((id): id is string => typeof id === "string")
    );
      
    const reusableBlockRefs = _.uniq(extractIdsFromNestedField(findObjectsByProperty(result, "relationTo", "reusable-blocks"), "value"))
    const allMediaRefs = _.uniq([...extractIdsFromNestedField(findObjectsByProperty(result, "media"), 'media'), ...extractIdsFromNestedField(findObjectsByProperty(result, "relationTo", "media"), "value")])

    const data = {
      tenant: result.tenant,
      shared_blocks: reusableBlockRefs,
      media: allMediaRefs,
      ...(type === "page" ? { page: result.id} : {block: result.id })
    };

    const existing = await payload.find({
      collection: COLLECTION_REFS_TRACK,
      where: { ...(type === "page" ? { page: { equals: result.id } } : { block: { equals: result.id } }) },
      depth: 0
    });

    if(existing.totalDocs > 0) {
      if(!arraysAreEqual(existing.docs[0].shared_blocks as any[], data.shared_blocks) || !arraysAreEqual(existing.docs[0].media as any[], data.media)) {
        await payload.update({ collection: COLLECTION_REFS_TRACK, id: existing.docs[0].id, data })
      }
    } else if(data.shared_blocks.length > 0 || data.media.length > 0) {
      await payload.create({ collection: COLLECTION_REFS_TRACK, data });
    }
  } else if(operation === "delete" || operation === "deleteByID") {
    const ids: string[] = operation === "delete" ? result.docs.map(x => x.id) : [result.id];
    await payload.delete({
      collection: COLLECTION_REFS_TRACK,
      where: { ...(type === "page" ? { page: { in: ids } } : { block: { in: ids } }) },
      depth: 0
    });
  }
}