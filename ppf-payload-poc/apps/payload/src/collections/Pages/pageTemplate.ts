import { Page } from '@/payload-types';
import type { Field } from 'payload'
import { deepMerge } from 'payload'

type PageTemplateField = (label?: string, description?: string, overrides?: Partial<Field>) => Field

type PageField = keyof Page

interface PageType {
  label: string
  name: string
  fields: PageField[]
}

export const pageTypes: PageType[] = [
  {
    label: 'Standard Page',
    name: 'standardPage',
    fields: [
      'title',
      'hero',
      'layout'
    ]
  },
  {
    label: 'Article Page',
    name: 'articlePage',
    fields: [
      'title',
      //'hero',
      //'ctaBlocks',
      //'preamble',
      'layout',
      'authors',
      'populatedAuthors',
      'related'
    ]
  },
  {
    label: 'Product Page',
    name: 'productPage',
    fields: [
      'title',
      'hero',
      //'quickFactsBlocks',
      //'preamble',
      'layout',
      'related',
      'products'
    ]
  },
  {
    label: 'Documentation Page',
    name: 'documentationPage',
    fields: [
      'title', 
      'layout',
      //'parentProduct'
    ]
  },
  {
    label: 'List Page',
    name: 'listPage',
    fields: [
      'title', 
      'hero',
      'layout'
      //'ctaBlocks', 
      
      //'preamble', 
    ]
  },
  {
    label: 'Showcase Page',
    name: 'showcasePage',
    fields: [
      'title', 
      'hero',
      'layout'
      //'uilogouploud', 
      //'mediaimages', 
      //'ctaBlocks', 
    ]
  },
  {
    label: 'Landing Page',
    name: 'landingPage',
    fields: [
      'title', 
      'hero',
      'layout',
      //'ctaBlocks', 
    ]
  },
  {
    label: 'Legal Page',
    name: 'legalPage',
    fields: [
      'title', 
      'subtitle', 
      'layout',
      //'effectiveDate', 
      'personalData', 
      //'parentProduct'
    ]
  },
  {
    label: 'Application Page',
    name: 'applicationPage',
    fields: [
      'title', 
      'applicationReference'
    ]
  }
]

const pageTemplateOptions = pageTypes.map((page) => ({
  label: page.label,
  value: page.name
}))

export function checkFieldExistsOnTemplate(pagetemplate: string, fieldname: PageField): boolean {
  const page = pageTypes.find((page) => page.name === pagetemplate)
  return page ? page.fields.includes(fieldname) : false
}

const pageTemplateField: PageTemplateField = (label, description, overrides = {}) => {
  return deepMerge<Field, Partial<Field>>(
    {
      type: 'select', // required
      name: 'pageTemplate', // required
      label: label,
      hasMany: false,
      admin: {
        isClearable: false,
        position: 'sidebar',
        description: description
      },
      defaultValue: 'standardPage',
      options: pageTemplateOptions
    },
    overrides
  )
}

export default pageTemplateField
