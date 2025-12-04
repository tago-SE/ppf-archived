import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { canCreateCollectionAsync, canMutateCollectionAsync, canReadCollectionAsync } from './access/defaultCollectionAccess'
import { beforeDeleteRefCheck } from './hooks/beforeDeleteRefCheck'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: canCreateCollectionAsync,
    delete: canMutateCollectionAsync,
    read: canReadCollectionAsync,
    update: canMutateCollectionAsync
  },
  fields: [
    {
      name: 'IdName',
      label: 'ID Name',
      virtual: true,
      type: 'text',
      hooks: {
        afterRead: [
          (args) => {
            return {
              filename: args.originalDoc?.filename,
              id: args.originalDoc?.id
            }
          }
        ]
      },
      admin: {
        hidden: true,
        components: {
          Cell: {
            path: '@/components/CustomMediaUpload/IdNameCell/index.client.tsx',
            clientProps: {
              className: 'default-cell__first-cell'
            }
          }
        }
      }
    },
    {
      name: 'mediaSource', // required
      type: 'radio', // required
      required: true,
      options: [
        // required
        {
          label: 'Upload',
          value: 'upload',
        },
        {
          label: 'ImageShop',
          value: 'imageshop',
        },
        {
          label: 'Dream Broker',
          value: 'dreambroker',
        },
      ],
      defaultValue: 'upload',
      admin: {
        layout: 'horizontal',
        description: 'Select the media source',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        hidden: true,
        disableListColumn: true
      }
    },
    {
      name: 'externalThumbnailURL',
      type: 'text',
      admin: {
        hidden: true,
        disableListColumn: true
      }
    },
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    }
  ],
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['IdName', 'mediaSource', 'alt', 'caption', 'tenant'],
    enableRichTextLink: true,
    enableRichTextRelationship: true,
    components: {
      edit: {
        Upload: {
          path: '@/components/CustomMediaUpload/Modal/index.server.tsx',
        },
        SaveButton: "@/components/SaveButton"
      },
    },
    custom: {
      SHOWSIZEDIALOGUE: true,
      SHOWCROPDIALOGUE: true,
      IMAGESHOPINTERFACENAME: "Lifestyle Image Library",
      IMAGE_SIZES: "980x660;980x660",
      CULTURE: "en-us",
      HIDEIMAGEINFO: false,
      INSERTIMIDIATELY: false,
      FREECROP: false,
      PROFILEID: "Lifestyle Image Library",
    }
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: ({ doc }) => {
      if(doc.mediaSource != 'upload') {
        return doc.externalThumbnailURL as string;
      }

      return doc.thumbnailURL as string;
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  hooks: {
    beforeDelete: [beforeDeleteRefCheck],
    beforeChange: [
      ({ data }) => {
        if(data.mediaSource != 'upload') {
          data.url = null;
          data.filename = null;
          data.mimeType = null;
          return data;
        } else {
          data.externalUrl = null;
          data.externalThumbnailURL = null
        }
      }
    ],
    afterRead: [
      ({ doc }) => {
        if(doc.mediaSource != 'upload') {
          doc.url = null;
          doc.filename = null;
          doc.mimeType = null;
          return doc;
        } else {
          doc.externalUrl = null;
          doc.externalThumbnailURL = null
        }
      }
    ]
  }
}
