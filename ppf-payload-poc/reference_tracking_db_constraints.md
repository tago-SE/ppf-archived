This is Docs placeholder at the moment!!!

## PayloadCMS DB schema overrides

Schema overriides can be done in /serc/lib/db/postgresAdapter.ts in afterSchemaInit hook. PayloadCMS under the hood ese Direzzle ORM, and the schema object is KIND OF Drizzle shcema - it's mix of PayloadCMS and Drizzle, and because of this to make schema overrides the Drizzle documentation is helpful, but not precise!

## DB cascade constraints

In `postgresAdapter.ts` theres `updateFk` helper function which alters cascade constraints for one-to-many relations.

For many-to-many relations I coulnd't find solution how to override cascade constraints with schema overrides. Only way is to manually edit migration files and I advise not to edit migration files manually, it should be avoided at all costs!

## Document delete restrictions

It is possible to restrict deleting document if it's referenced by other document. For example, disallow to delete media if it's referenced by home page. With mentioned DB schema overrides, you can use `updateFk` function to set on cascade restrict constraint fro one-to-many relation.

However, this is not advised solution, because:
1. Quite many relations in DB are many-to-many.. restrictions can be set only to one-to-many. But maybe there is solution for many-to-many..
2. It is not possible to set error message shown on UI, it will always show "Something went wrong".
3. It is not possible restrict deletion on DB level if content is referenced thorugh rich text field. Rich text field in DB is stored as JSON.

Also, in PayloadCMS (Local API) it is not possible to make SQL queries for JSON field. Postgres has sopport for it, but it's either PayloadCMS or Drizlle query builder which limits what kind of queries we can do.

## Hook based document delete restrictions

hook level vs db level cascade delete!

Solution at the moment to restrict used content deletion is to track every reference in separate collection - Reference Tracking Collection. We have developed a hook - `/src/collections/hooks/updateRef.ts` which takes document and extract all references to other collections and stores in reference tracking collection. The hook extracts references from rich text fields as well.

The structure of Reference Tracking Table

page - document id for the page, if references are tracked for a page
block - document id for the shared block, if references are tracked for a block

media - all media used in page or shared block
shared_blocks - all shared block used in page or shared block

To restrict content deletion use `beforeDeleteRefCheck` hook (`src/collections/hooks/beforeDeleteRefCheck.ts`). It checks if the content is used somewhere and throws exception. It shows customized error message on UI.

The peroframcen of extracting Ids and then lookup in Reference Tracking Collection haven't been measured, but with demo portal which we bade it works fast!