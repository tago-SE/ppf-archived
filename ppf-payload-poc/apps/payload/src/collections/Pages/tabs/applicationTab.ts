import { Field, Tab } from "payload";
import { checkFieldExistsOnTemplate } from "../pageTemplate";

export const applicationTab: Tab = {
    label: 'Application',
    admin: {
        condition: (data) => {
          return checkFieldExistsOnTemplate(data.pageTemplate, 'applicationReference')
        }
    },
    fields: [
        {
            name: 'applicationReference',
            type: 'text',
            label: 'Application',
            admin: {
              position: 'sidebar',
              condition: (data) => {
                return checkFieldExistsOnTemplate(data.pageTemplate, 'applicationReference')
              },
              description:
                'Reference to an application that is added in the site. Applications are added according to Microfrontend archtecture and webpack module federation.'
            }
        },
    ]
}