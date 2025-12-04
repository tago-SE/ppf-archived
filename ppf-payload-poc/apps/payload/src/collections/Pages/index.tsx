//import { slugField, pathField } from '@/payload/fields'
import type { CollectionConfig } from 'payload'
//import { generateDocumentCacheKey } from '@/payload/utils/getDocument'
//import { isAdmin, isAdminOrPublished } from '@/payload/access'
//import { ImageShop } from '@/components/ImageShop/imageShop.server'
//import { IDSIcons } from '@/components/IDSIcons/idsIcons.server'
import {
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'
//import FieldSeparator from '@/components/FieldSeparator/FieldSeparator.server'
import { COLLECTION_REFS_TRACK, COLLECTION_SLUG_DYANMIC_PAGE, COLLECTION_SLUG_MEDIA, COLLECTION_SLUG_REUSABLE_BLOCKS, COLLECTION_SLUG_USERS } from '../config'
import pageTemplateField, { checkFieldExistsOnTemplate } from './pageTemplate'
//import QuoteBlock from '@/payload/blocks/quote'
//import { setDynamicDefaultValues } from './hooks/setDynamicDefaultValues'
//import ButtonBlock from '@/payload/blocks/button'
//import QuickFactBlock from '@/payload/blocks/quickFact'
import { canCreateCollectionAsync, canMutateCollectionAsync, canReadCollectionAsync } from '../access/defaultCollectionAccess'
import { slugField } from '@/fields/slug'
import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from '@payloadcms/plugin-seo/fields'
import { Content } from '@/blocks/Content/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { createParentField } from '@payloadcms/plugin-nested-docs'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { productTab } from './tabs/productTab'
import { heroTab } from './tabs/heroTab'
import { Banner } from '@/blocks/Banner/config'
import { applicationTab } from './tabs/applicationTab'
import { legalTab } from './tabs/legalTab'
import { relatedTab } from './tabs/relatedTab'
import _ from 'lodash'
import { updateReferenceTrack } from '../hooks/updateRefs'

export const DyanmicPages: CollectionConfig = {
  slug: COLLECTION_SLUG_DYANMIC_PAGE,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageTemplate', 'path', 'updatedAt', 'createdAt'],
    components: {
        edit: {
          PublishButton: "@/components/PublishButton",
        }
    }
  },
  versions: {
    drafts: {
        autosave: {
            interval: 100, // We set this interval for optimal live preview
        },
        schedulePublish: true
    },
    maxPerDoc: 50
  },
  access: {
      create: canCreateCollectionAsync,
      delete: canMutateCollectionAsync,
      read: canReadCollectionAsync,
      update: canMutateCollectionAsync,
  },
  hooks: {
    afterChange: [revalidatePage],
    afterOperation: [updateReferenceTrack],
    beforeChange: [populatePublishedAt],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete]
  },
  fields: [
    // Common fields
    ...slugField(),
    createParentField(COLLECTION_SLUG_DYANMIC_PAGE, {
        filterOptions: ({ id, data }) => {
            return {
                id: { not_equals: id },
                and: [
                    {
                        tenant: {
                            equals: data.tenant,
                        },
                    },
                ],
            };
        },
    }),
    {
        name: 'publishedAt',
        type: 'date',
        admin: {
          position: 'sidebar',
        },
    },
    {
        name: 'authors',
        type: 'relationship',
        admin: {
            position: 'sidebar',
        },
        hasMany: true,
        relationTo: COLLECTION_SLUG_USERS,
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
        name: 'populatedAuthors',
        type: 'array',
        access: {
            update: () => false,
        },
        admin: {
            disabled: true,
            readOnly: true,
        },
        fields: [
            {
                name: 'id',
                type: 'text',
            },
            {
                name: 'name',
                type: 'text',
            },
        ],
    },
    {
        type: 'text',
        name: 'title',
        required: true,
        label: 'Title',
        localized: true,
        admin: {
          description: 'A clear, and concise statement that captures the core message or value proposition of the page',
          width: '75%',
          condition: (data) => {
            return checkFieldExistsOnTemplate(data.pageTemplate, 'title')
          }
        }
    },
    // Move title size to hero tab?
    
    {
      type: 'tabs',
      tabs: [
        heroTab,
        /*{
          label: 'Content',
          fields: [
            {
              type: 'row', // required
              fields: [
                {
                  type: 'text',
                  name: 'title',
                  required: true,
                  label: 'Title',
                  admin: {
                    description: 'A clear, and concise statement that captures the core message or value proposition of the page',
                    width: '75%',
                    condition: (data) => {
                      return checkFieldExistsOnTemplate(data.pageTemplate, 'title')
                    }
                  }
                },
                {
                  type: 'select', // required
                  name: 'titleSize', // required
                  label: 'Heading Size',
                  hasMany: false,
                  admin: {
                    isClearable: true,
                    width: '25%',
                    description: 'Size of the H1 tag in the page',
                    condition: (data) => {
                      return checkFieldExistsOnTemplate(data.pageTemplate, 'titleSize')
                    }
                  },
                  defaultValue: 'medium',
                  options: [
                    {
                      label: 'Small',
                      value: 'small'
                    },
                    {
                      label: 'Medium (Default)',
                      value: 'medium'
                    },
                    {
                      label: 'Large',
                      value: 'large'
                    },
                    {
                      label: 'Largest',
                      value: 'largest'
                    }
                  ]
                }
              ]
            },
            {
              name: 'subtitle',
              type: 'textarea',
              label: 'Subtitle',
              admin: {
                description: 'Additional text that provides more detail or context to the title',
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'subtitle')
                }
              }
            },
            {
              name: 'uilogouploud',
              label: 'Logo for Showcase partner',
              type: 'text',
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'uilogouploud')
                },
                components: {
                  Field: FieldSeparator
                },
                custom: {
                  hideLabel: false,
                  hideSeparator: true
                }
              }
            },
            {
              type: 'upload',
              name: 'mediaimages',
              label: 'Upload',
              relationTo: COLLECTION_SLUG_MEDIA,
              filterOptions: {
                mimeType: { contains: 'image' }
              },
              admin: {
                description: 'Select and upload images to the Media library',
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'mediaimages')
                }
              }
            },
            {
              type: 'text',
              name: 'titleImage',
              label: 'Imageshop Media Libary',
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'titleImage')
                },
                description: 'Background image that is relevant and visually represents the theme or message of the page',
                components: {
                  Field: ImageShop
                },
                custom: {
                  SHOWSIZEDIALOGUE: true,
                  SHOWCROPDIALOGUE: true,
                  IMAGESHOPINTERFACENAME: 'Lifestyle Image Library',
                  IMAGE_SIZES: '980x660;980x660',
                  CULTURE: 'en-us',
                  HIDEIMAGEINFO: false,
                  INSERTIMIDIATELY: false,
                  FREECROP: false,
                  PROFILEID: 'Lifestyle Image Library'
                }
              }
            },
            {
              type: 'row', // required
              fields: [
                {
                  name: 'ctaText',
                  type: 'text',
                  required: false,
                  label: 'Call to Action Text',
                  admin: {
                    condition: (data) => {
                      return checkFieldExistsOnTemplate(data.pageTemplate, 'ctaText')
                    },
                    width: '50%',
                    description: 'A text to prompts the user to take a specific action, such as “Learn More,” “Sign Up,” “Get Started,” or “Buy Now”'
                  }
                },
                {
                  name: 'ctaLink',
                  type: 'text',
                  required: false,
                  label: 'Call to Action Link',
                  admin: {
                    condition: (data) => {
                      return checkFieldExistsOnTemplate(data.pageTemplate, 'ctaLink')
                    },
                    width: '50%',
                    description: 'Link to where a user action should go'
                  }
                }
              ]
            },
            {
              name: 'ctaBlocks', // required
              type: 'blocks', // required
              label: 'Call to Action Blocks',
              labels: {
                plural: 'Call to Action blocks',
                singular: 'Call to Action block'
              },
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'ctaBlocks')
                },
                description: 'Extra blocks in the introduction part of a page'
              },
              minRows: 1,
              maxRows: 20,
              blocks: [ButtonBlock, QuickFactBlock]
            },
            {
              name: 'contentseparator1',
              type: 'ui',
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'contentseparator1')
                },
                components: {
                  Field: FieldSeparator
                },
                custom: {
                  hideLabel: true,
                  hideSeparator: false
                }
              }
            },
            {
              name: 'quickFactsBlocks',
              type: 'blocks',
              label: 'Quick Facts',
              minRows: 2,
              maxRows: 3,
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'quickFactsBlocks')
                },
                description: 'Summarize the page with 2-3 quick facts '
              },
              blocks: [QuickFactBlock]
            },
            {
              name: 'primaryContentBlocks',
              type: 'blocks',
              label: 'Content Blocks',
              minRows: 1,
              maxRows: 40,
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'primaryContentBlocks')
                },
                description: 'Dynamically build the page by using blocks. Blocks in this area will come before the main text'
              },
              blocks: [QuickFactBlock, QuoteBlock, ButtonBlock]
            },
            {
              name: 'preamble',
              label: 'Preamble',
              type: 'richText',
              editor: lexicalEditor({
                features: () => [FixedToolbarFeature(), ItalicFeature(), LinkFeature({ enabledCollections: ['pages'] })]
              }),
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'preamble')
                },
                description:
                  'Provide a brief introduction to the main content. It typically outlines the subject matter and the reasons for the content that follows'
              }
            },
            {
              name: 'mainContent',
              label: 'Content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  FixedToolbarFeature(),
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  LinkFeature({ enabledCollections: ['pages', 'media'] }),
                  BoldFeature(),
                  ParagraphFeature(),
                  BlocksFeature({
                    blocks: [QuickFactBlock]
                  })
                ]
              }),
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'mainContent')
                },
                description: 'Main text content of the page'
              }
            },
            {
              name: 'effectiveDate',
              label: 'Effective Date',
              type: 'date',
              admin: {
                condition: (data) => {
                  return checkFieldExistsOnTemplate(data.pageTemplate, 'effectiveDate')
                },
                description: 'Date when content in this page will come effective',
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'yyyy MMMM dd'
                }
              }
            },
          ]
        },*/
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              label: 'Content Blocks',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: "useLinkedBlock",
                  type: "checkbox",
                  label: "Use Linked Block?",
                },
                {
                  name: "linkedBlock",
                  type: "relationship",
                  relationTo: COLLECTION_SLUG_REUSABLE_BLOCKS,
                  admin: { condition: (_, siblingData) => siblingData.useLinkedBlock },
                },
                {
                  name: 'customBlocks',
                  type: 'blocks',
                  blocks: [Content, Code, MediaBlock, Banner],
                  required: true,
                  admin: { condition: (_, siblingData) => !siblingData.useLinkedBlock },
                }
              ]
            }
          ]
        },
        {
            name: 'meta',
            label: 'SEO',
            localized: true,
            fields: [
                OverviewField({
                    titlePath: 'meta.title',
                    descriptionPath: 'meta.description',
                    imagePath: 'meta.image',
                }),
                MetaTitleField({
                    hasGenerateFn: true,
                }),
                MetaImageField({
                    relationTo: 'media',
                }),
                MetaDescriptionField({}),
                PreviewField({
                    // if the `generateUrl` function is configured
                    hasGenerateFn: true,

                    // field paths to match the target field for data
                    titlePath: 'meta.title',
                    descriptionPath: 'meta.description',
                }),
            ],
        },
        productTab,
        applicationTab,
        legalTab,
        relatedTab
        /*{
          label: 'Crosslink',
          name: 'crosslink',
          fields: [
            {
              type: 'text',
              name: 'crosslinkTitle',
              required: true,
              label: 'Title',
              admin: {
                description: 'Title to show when this page is referenced from other pages'
              }
            },
            {
              name: 'crosslinkSubtitle',
              type: 'textarea',
              required: true,
              label: 'Subtitle',
              admin: {
                description: 'Subtitle to show when this page is referenced from other pages'
              }
            },
            {
              type: 'text',
              name: 'crosslinkLifeStyleImage',
              label: 'Lifestyle Image',
              admin: {
                description: 'Lifestyle Image to show when this page is referenced from other pages',
                components: {
                  Field: ImageShop
                },
                custom: {
                  SHOWSIZEDIALOGUE: true,
                  SHOWCROPDIALOGUE: true,
                  IMAGESHOPINTERFACENAME: 'Lifestyle Image Library',
                  IMAGE_SIZES: '560x315;560x315',
                  CULTURE: 'en-us',
                  HIDEIMAGEINFO: false,
                  INSERTIMIDIATELY: false,
                  FREECROP: false,
                  PROFILEID: 'Lifestyle Image Library'
                }
              }
            },
            {
              type: 'text',
              name: 'crosslinkLifeStyleImageAlt',
              label: 'Life Style Image Alt',
              admin: {
                description: 'Alternate text to use for accessability when Lifestyle Image is used when this page is referenced from other pages'
              }
            },
            {
              type: 'text',
              name: 'crosslinkStudioImage',
              label: 'Studio Image',
              admin: {
                description: 'Studio Image to show when this page is references from other pages',
                components: {
                  Field: ImageShop
                },
                custom: {
                  SHOWSIZEDIALOGUE: true,
                  SHOWCROPDIALOGUE: true,
                  IMAGESHOPINTERFACENAME: 'Studio Image Library',
                  IMAGE_SIZES: '560x315;560x315',
                  CULTURE: 'en-us',
                  HIDEIMAGEINFO: false,
                  INSERTIMIDIATELY: false,
                  FREECROP: false,
                  PROFILEID: 'Studio Image Library'
                }
              }
            },
            {
              type: 'text',
              name: 'crosslinkStudioImageAlt',
              label: 'Studio Image Alt',
              admin: {
                description: 'Alternate text to use for accessability when Studio Image are used when this page is referenced from other pages'
              }
            },
            {
              name: 'crosslinkIcon',
              label: 'Content Icon',
              type: 'text',
              admin: {
                description: 'Icon to show when this page is referenced from other pages',
                components: {
                  Field: IDSIcons
                }
              }
            }
          ]
        },*/
        /*{
          label: 'Sharing',
          name: 'sharing',
          fields: [
            {
              type: 'text',
              name: 'sharingTitle',
              required: true,
              label: 'Title'
            },
            {
              name: 'sharingSubtitle',
              type: 'textarea',
              required: true,
              label: 'Description'
            },
            {
              type: 'text',
              name: 'sharingImage',
              label: 'Meta Image',
              admin: {
                components: {
                  Field: ImageShop
                },
                custom: {
                  SHOWSIZEDIALOGUE: true,
                  SHOWCROPDIALOGUE: true,
                  IMAGESHOPINTERFACENAME: 'Lifestyle Image Library',
                  IMAGE_SIZES: '1200x630;1200x630',
                  CULTURE: 'en-us',
                  HIDEIMAGEINFO: false,
                  INSERTIMIDIATELY: false,
                  FREECROP: false,
                  PROFILEID: 'Lifestyle Image Library'
                }
              }
            }
          ]
        }*/
      ]
    },
    pageTemplateField('Page Template', 'Select what kind of template should be used for the page'),
  ]
}
