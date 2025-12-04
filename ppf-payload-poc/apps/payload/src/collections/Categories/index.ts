import type { CollectionConfig } from 'payload'
import { canCreateCollectionAsync, canMutateCollectionAsync, canReadCollectionAsync } from '../access/defaultCollectionAccess'
import { COLLECTION_SLUG_CATEGORIES } from '../config'

export const Categories: CollectionConfig = {
  slug: COLLECTION_SLUG_CATEGORIES,
  access: {
    create: canCreateCollectionAsync,
    delete: canMutateCollectionAsync,
    read: canReadCollectionAsync,
    update: canMutateCollectionAsync,
  },
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        SaveButton: "@/components/SaveButton"
      }
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    }
  ],
}
