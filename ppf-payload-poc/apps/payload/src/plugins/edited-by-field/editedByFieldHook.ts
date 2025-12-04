import { CollectionBeforeChangeHook } from "payload"

export const editedByFieldHook = (
  fieldName: string
) => {
  return async (...[args]: Parameters<CollectionBeforeChangeHook>) => {
    if (
      args.operation === 'update' &&
      args.data !== undefined &&
      args.req.user !== undefined &&
      args.req.user !== null
    ) {
      args.data[fieldName] = args.req.user.id
    }

    return args.data
  }
}