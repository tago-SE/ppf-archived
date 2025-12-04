import { LocaleInputType, PageQuery } from "../gql/generated"

export type LocationSearchParams = {
  l?: LocaleInputType
}

export type PageDataType = NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number];