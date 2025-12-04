import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'tenant',
      type: 'text',
      virtual: true,
      admin: {
        hidden: true
      },
      hooks: {
        afterRead: [
          (args) => {
            return args.data?.tenant
          }
        ]
      }
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: async ({ data }) => {
        return data.tenant ? {
          tenant: { equals: data.tenant }
        } : false
      }
    },
  ],
}
