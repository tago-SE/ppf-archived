import { hero } from "@/fields/hero";
import { Tab } from "payload";
import { checkFieldExistsOnTemplate } from "../pageTemplate";

export const heroTab: Tab = {
    label: 'Hero',
    admin: {
      condition: (data) => {
        return checkFieldExistsOnTemplate(data.pageTemplate, 'hero')
      }
    },
    fields: [
        {
            type: 'select', // required
            name: 'titleSize', // required
            label: 'Heading Size',
            hasMany: false,
            admin: {
              isClearable: true,
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
        hero
    ]
}