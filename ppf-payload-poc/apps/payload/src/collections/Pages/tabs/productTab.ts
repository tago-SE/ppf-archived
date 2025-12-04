import { Field, Tab } from "payload";
import { checkFieldExistsOnTemplate } from "../pageTemplate";
import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";

export const productTab: Tab = {
    label: 'Products',
    name: 'products',
    admin: {
        condition: (data) => {
          return checkFieldExistsOnTemplate(data.pageTemplate, 'products')
        }
    },
    fields: [
        {
            name: 'references', // required
            type: 'array', // required
            label: 'Products',
            minRows: 1,
            admin: {
              description: 'References to Products in connected product management system'
            },
            labels: {
              singular: 'Product',
              plural: 'Products'
            },
            required: true,
            fields: [
              // required
              {
                name: 'productId',
                type: 'text',
                label: 'ProductId',
                admin: {
                  condition: (data) => {
                    return checkFieldExistsOnTemplate(data.pageTemplate, 'products')
                  },
                  description: 'Reference to a product, in the format of GUID'
                }
              }
            ]
        },
        {
            name: 'category', // required
            type: 'select', // required
            hasMany: true,
            admin: {
              isClearable: true
            },
            required: true,
            options: [
              {
                label: 'Mobility',
                value: 'mobility'
              },
              {
                label: 'Person',
                value: 'person'
              },
              {
                label: 'Property',
                value: 'property'
              },
              {
                label: 'Analytics',
                value: 'analytics'
              },
              {
                label: 'Communication',
                value: 'communication'
              },
              {
                label: 'Identity & Party',
                value: 'identity_and_party'
              },
              {
                label: 'Industrial',
                value: 'industrial'
              },
              {
                label: 'Risk & Compliance',
                value: 'risk_and_compliance'
              },
              {
                label: 'Self-Service',
                value: 'self-service'
              },
              {
                label: 'Other',
                value: 'other'
              }
            ]
        },
        {
            name: 'type', // required
            type: 'select', // required
            hasMany: true,
            admin: {
              isClearable: true
            },
            required: true,
            options: [
              {
                label: 'Buy Insurance',
                value: 'buy_Insurance'
              },
              {
                label: 'Request Quote',
                value: 'request_quote'
              },
              {
                label: 'TryOn Insurance',
                value: 'tryon_insurance'
              },
              {
                label: 'See Engagement',
                value: 'see_engagement'
              },
              {
                label: 'Check Coverage',
                value: 'check_coverage'
              },
              {
                label: 'Insurance Policy',
                value: 'insurance_policy'
              }
            ],
        },
        {
            name: 'consumers', // required
            type: 'select', // required
            hasMany: true,
            required: true,
            admin: {
              isClearable: true
            },
            options: [
              {
                label: 'Road Side Assistance',
                value: 'road_side_assistance'
              },
              {
                label: 'Private Customer',
                value: 'private_customer'
              },
              {
                label: 'Commercial Customer',
                value: 'commercial_customer'
              },
              {
                label: 'Industrial Customer',
                value: 'industrial_customer'
              },
              {
                label: 'Car Retailers',
                value: 'car_retailers'
              },
              {
                label: 'Car Manufacturers',
                value: 'car_manufacturers'
              },
              {
                label: 'Insurance Brokers',
                value: 'insurance_brokers'
              },
              {
                label: 'Integration Partner',
                value: 'integration_partner'
              }
            ]
        },
        {
            name: 'country', // required
            type: 'select', // required
            hasMany: true,
            admin: {
              isClearable: true
            },
            required: true,
            options: [
              {
                label: 'Global',
                value: 'global'
              },
              {
                label: 'Nordic',
                value: 'nordic'
              },
              {
                label: 'Sweden',
                value: 'sweden'
              },
              {
                label: 'Norway',
                value: 'norway'
              },
              {
                label: 'Finland',
                value: 'finland'
              },
              {
                label: 'Baltic',
                value: 'baltic'
              },
              {
                label: 'Estonia',
                value: 'estonia'
              },
              {
                label: 'Latvia',
                value: 'latvia'
              },
              {
                label: 'Lithuania',
                value: 'lithuania'
              }
            ]
        },
    ]
}