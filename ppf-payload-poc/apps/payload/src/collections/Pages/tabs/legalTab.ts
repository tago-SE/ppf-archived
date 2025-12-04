import { Field, Tab } from "payload";
import { checkFieldExistsOnTemplate } from "../pageTemplate";

export const legalTab: Tab = {
    label: 'Legal',
    admin: {
        condition: (data) => {
          return checkFieldExistsOnTemplate(data.pageTemplate, 'personalData')
        }
    },
    fields: [
        {
            name: 'personalData', // required
            type: 'select', // required
            hasMany: false,
            admin: {
              position: 'sidebar',
              condition: (data) => {
                return checkFieldExistsOnTemplate(data.pageTemplate, 'personalData')
              },
              description:
                'Is the legal page a product legal appendix, Data Transfer Addendum or Data Processing Addendum page. These pages are used to view legal appendices for API Products.'
            },
            required: false,
            defaultValue: 'api_product_legal-appendix',
            options: [
              {
                label: 'API Product Legal Appendix',
                value: 'api_product_legal-appendix'
              },
              {
                label: 'Data Transfer Addendum',
                value: 'data_transfer_addendum'
              },
              {
                label: 'Data Processing Addendum',
                value: 'data_processing_addendum'
              }
            ]
        },
    ]
}