# Postgres Quick Info

In relational databases like Postgres, migrations are a bit more important, because each time you add a new field or a new collection, you'll need to update the shape of your database to match your Payload Config (otherwise you'll see errors upon trying to read / write your data).

That means that Postgres users of Payload should become familiar with the entire migration workflow from top to bottom.

Here is an overview of a common workflow for working locally against a development database, creating migrations, and then running migrations against your production database before deploying.

<https://payloadcms.com/docs/database/migrations>

## Create first fresh migration

`npm run payload migrate:create <migration>`

`npm run payload migrate:fresh`

`npm run payload migrate:status`

## Migrating with existing data

    <TODO>
