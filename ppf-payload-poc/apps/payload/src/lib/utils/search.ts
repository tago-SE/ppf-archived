import { Page } from "@/payload-types";
import { CollectionSlug, PayloadRequest } from "payload";

function collectValuesBySelector(
  obj: any,
  selectorFn: (currentObj: any, parentObj: any, path: string[]) => string | null | undefined,
  parent: any = null,
  path: string[] = []
): string[] {
  let result: string[] = [];

  if (typeof obj !== "object" || obj === null) {
    return result;
  }

  const selectedValue = selectorFn(obj, parent, path);
  if (typeof selectedValue === "string") {
    result.push(selectedValue);
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      result = result.concat(collectValuesBySelector(obj[i], selectorFn, obj, [...path, String(i)]));
    }
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result = result.concat(collectValuesBySelector(obj[key], selectorFn, obj, [...path, key]));
      }
    }
  }

  return result;
}

export function getSearchableContent({ req, collectionSlug, data }: { req: PayloadRequest, collectionSlug: CollectionSlug, data: Page }) {
    const texts = collectValuesBySelector(data, (obj, parent, path) => {
      if (["meta", "breadcrumbs", "tenant"].includes(path[0])) {
        return;
      }

      if (path.includes("media")) {
        return;
      }

      const keys = ["text", "code"];
      for (const key of keys) {
        if (typeof obj[key] === "string") {
          return obj[key];
        }
      }
    });
  
    const result = texts.join(' ').replace(/\s+/g, ' ')
    return result;
}