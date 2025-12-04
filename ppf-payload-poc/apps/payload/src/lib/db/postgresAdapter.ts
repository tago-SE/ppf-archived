import type { Args } from "@payloadcms/db-postgres/types";
import {
  ChainedTokenCredential,
  DefaultAzureCredential,
  ManagedIdentityCredential,
  VisualStudioCodeCredential,
} from "@azure/identity";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { DBLogger } from "./logger";
import { strToBoolean } from "../utils/strToBoolean";
import { withNodeCache } from "../utils/cache/node_cache";
import { PgUUID } from "drizzle-orm/pg-core";

type ParsedPoolConfig = Pick<
  Pick<Args, "pool">["pool"],
  | "user"
  | "password"
  | "host"
  | "port"
  | "database"
  | "ssl"
  | "connectionString"
>;

const scope = "https://ossrdbms-aad.database.windows.net";
/**
 * Parses a connection string and returns Postgres PoolConfig.
 *
 * @param connectionString - Expectedted format: postgres://{user}:{password | empty}@{host}:{port}/{database}
 * @param credential - Used to create password promise. The password should be empty in the connectionString.
 */
function connectionStringToPostgresPoolConfig(
  connectionString: string,
  credential?: ChainedTokenCredential
) {
  if (!connectionString) {
    return {};
  }
  const url = new URL(connectionString);
  if (url.protocol !== "postgres:") {
    throw new Error("Invalid protocol. Expected 'postgres://'");
  }
  const decodedPassword = decodeURIComponent(url.password);
  const user = decodeURIComponent(url.username);
  const port = Number(url.port);
  const database = url.pathname.slice(1);
  const isLocalHost = url.hostname.includes("localhost");
  const shouldUseCredential = !decodedPassword && credential;
  const ssl = isLocalHost
    ? undefined
    : {
      // https://stackoverflow.com/questions/1406025/no-pg-hba-conf-entry-for-host
      rejectUnauthorized: false,
    };
  if (!!decodedPassword) {
    const poolConfig = {
      connectionString,
      ssl: ssl,
    } as ParsedPoolConfig;
    return poolConfig;
  }
  const poolConfig = {
    user: user,
    password: shouldUseCredential
      ? withNodeCache(
        async () => {
          const data = await credential.getToken(scope);
          const { token, tokenType, ...info } = data;
          const refreshAfter = new Date(info.expiresOnTimestamp);
          info.refreshAfterTimestamp = refreshAfter.getTime();
          const expiresIn = Math.floor(
            (info.expiresOnTimestamp - Date.now()) / 1000
          );
          console.log("PostgreSQL:Client - getToken", {
            tokenType,
            token: `${token.substring(0, 3)}***`,
            expiresIn: `${expiresIn}s`,
            refreshAfter,
          });
          return token;
          // The cache time could be increaded to better match when the token actually expires
        },
        ["PostgreSQL:password"],
        { revalidate: 300 }
      )
      : decodedPassword,
    host: url.hostname,
    port: port <= 0 ? undefined : port,
    database: database,
    ssl: ssl,
  } as ParsedPoolConfig;
  return poolConfig;
}

const useDBDebugger = strToBoolean(process.env.DATABASE_DEBUG_LOGGER) ?? false;

function updateFk(
  schema: any,
  tableName: string,
  tableColumnName: string,
  foreignTableName: string,
  foreignColumnName: string,
  onUpdate: string,
  onDelete: string
) {
  const indexInlineFKs = Symbol.for(`drizzle:PgInlineForeignKeys`);
  const indexTableName = Symbol.for(`drizzle:Name`);
  const fkeys =
    schema.relations[`relations_${tableName}`].table[indexInlineFKs];

  // @ts-expect-error workaround
  fkeys.forEach((foreignKey) => {
    const ref = foreignKey.reference();

    if (ref.columns.length !== 1) {
      throw new Error("Only one column is supported");
    }

    if (ref.foreignColumns.length !== 1) {
      throw new Error("Only one foreign column is supported");
    }

    const actualColumnName = ref.columns[0].name;
    const actualForeignTableName = ref.foreignTable[indexTableName];
    const actualForeignColumnName = ref.foreignColumns[0].name;

    if (actualColumnName !== tableColumnName) return;
    if (actualForeignTableName !== foreignTableName) return;
    if (actualForeignColumnName !== foreignColumnName) return;

    foreignKey.onUpdate = onUpdate;
    foreignKey.onDelete = onDelete;
  });
}

const createCredentials = (): ChainedTokenCredential | undefined => {
  const clientId = process.env.DATABASE_CLIENT_ID;
  // TODO: Remove testing code from production code
  const accessToken = process.env.TEST_AZ_DEVELOPER_ACCESS_TOKEN;
  if (!!accessToken) {
    return undefined;
  }
  if (!!clientId) {
    return new ChainedTokenCredential(
      new ManagedIdentityCredential({ clientId: clientId })
    );
  }
  return new ChainedTokenCredential(
    ...[new VisualStudioCodeCredential(), new DefaultAzureCredential()]
  );
};

export const postgresDbAdapter = postgresAdapter({
  idType: "uuid",
  push: false,
  logger: useDBDebugger ? new DBLogger() : undefined,
  pool: connectionStringToPostgresPoolConfig(
    process.env.DATABASE_URI!,
    createCredentials()
  ),
  afterSchemaInit: [
    async ({ schema }: any) => {
      // NOTE: leaving this as an example on how to override one-to-many relation constraints
      // For blocks and media this is not needed, because delete is restricted in beforeDelete hook
      // updateFk(schema, "pages_layout", "linked_block_id", "reusable_blocks", "id", "no action", "restrict");
      // updateFk(schema, "pages_blocks_media_block", "media_id", "media", "id", "no action", "restrict")

      // Changes column typt to uuid. Maybe manually add reference as well?
      const table = schema.tables["refs_track_texts"];
      const column = new PgUUID(table, {
        name: "text",
        keyAsName: false,
        notNull: false,
        default: undefined,
        hasDefault: false,
        primaryKey: false,
        isUnique: false,
        uniqueName: "refs_track_texts_text_unique",
        uniqueType: undefined,
        dataType: "string",
        columnType: "PgUUID",
        generated: undefined,
        length: undefined,
        enumValues: undefined,
      } as any);

      const drizzleColumns = Symbol.for(`drizzle:Columns`);
      table[drizzleColumns]["text"] = column;

      return schema;
    },
  ],
});
