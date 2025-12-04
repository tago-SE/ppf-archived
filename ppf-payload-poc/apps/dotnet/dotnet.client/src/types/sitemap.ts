import { InitialQuery } from "../gql/generated"

export type Sitemap = NonNullable<NonNullable<InitialQuery["SitemapByTenant"]>["docs"]>