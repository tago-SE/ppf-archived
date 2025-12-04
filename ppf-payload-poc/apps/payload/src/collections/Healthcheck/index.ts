import { CollectionConfig } from "payload";
import { COLLECTION_SLUG_HEALTHCHECK } from "../config";
import { getHealthcheckStatus } from "./endpoints/getHealthcheckStatus";

export const Healthcheck: CollectionConfig = {
  slug: COLLECTION_SLUG_HEALTHCHECK,
  access: {
    create: (_) => false,
    update: (_) => false,
    delete: (_) => false,
    read: () => false,
  },
  admin: {
    hidden: true,
  },
  fields: [],
  endpoints: [getHealthcheckStatus],
};
