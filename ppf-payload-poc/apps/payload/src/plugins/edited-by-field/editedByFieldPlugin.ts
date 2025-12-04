import type { CollectionSlug, Config, Field } from 'payload'
import { editedByFieldHook } from './editedByFieldHook'

const EDITED_BY_FIELD_NAME = 'editedBy'
const EDITED_BY_FIELD_LABEL = 'Edited By'

export type PluginConfig = {
  userSlug: CollectionSlug
}

/*
  Edited By field plugin

  Adds "Edited By" field to all collections
  and automatically populates it with current user on save.

  Edited By field is hidden read-only and hidden from admin ui,
  used for logging purposes.
 */
export const editedByFieldPlugin = (pluginConfig: PluginConfig) => (config: Config): Config => {
  // Apply Edited By field to collections
  if (config.collections === undefined) return config

  const collections = config.collections.filter(x => !x.fields.some(field => 'name' in field && field.name === EDITED_BY_FIELD_NAME))

  if (collections.length !== config.collections.length) {
    const overlappingObjects = config.collections.filter(x => x.fields.some(field => 'name' in field && field.name === EDITED_BY_FIELD_NAME))
    const slugs = overlappingObjects.map(x => x.slug).join(', ')
    console.warn(`[EditedByField Plugin]: Skipping some objects, because following slugs already contain 'Edited By' field: ${slugs}`)
  }

  for (let collection of collections) {
    // Amend Edited By field
    collection.fields = [
      ...collection.fields,
      createField({
        name: EDITED_BY_FIELD_NAME,
        label: EDITED_BY_FIELD_LABEL,
        userSlug: pluginConfig.userSlug
      })
    ]

    // Amend a hook to update Edited By
    collection.hooks = {
      ...collection.hooks,
      beforeChange: [
        ...(collection.hooks?.beforeChange ?? []),
        editedByFieldHook(EDITED_BY_FIELD_NAME)
      ]
    }
  }

  // Currently 'Edited By' field is only added to collections
  // It is possible to reuse the same code for "Edited By"

  return config
}

type CreateFieldProps = {
  name: string,
  label: string
  userSlug: CollectionSlug
}
const createField = ({ name, label, userSlug }: CreateFieldProps): Field => {
  return {
    name,
    label,
    type: 'relationship',
    relationTo: userSlug,
    defaultValue: (args) =>
      args.user !== null
        ? args.user.id : null,
    admin: {
      hidden: true, // Field hidden in the sidebar, and only appears in version history
      readOnly: true,
      position: 'sidebar',
    }
  }
}