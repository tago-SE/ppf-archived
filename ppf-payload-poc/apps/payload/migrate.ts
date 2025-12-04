import { BasePayload, getPayload } from "payload";
import config from "./src/payload.config";
import fs from "fs";
import path from "path";

const MIGRATIONS_COLLECTION = "payload-migrations"

const deleteFilesByExtensionsSync = (payload: BasePayload, directory: string, extensions: string[]) => {
    try {
      const files = fs.readdirSync(directory);
      files.forEach((file) => {
        if (extensions.includes(path.extname(file))) {
          fs.unlinkSync(path.join(directory, file));
          payload.logger.info(`Deleted: ${file}`);
        }
      });
    } catch (err) {
        payload.logger.error("Error:", err);
    }
};
  
async function main() {
    const payload = await getPayload({ config });
    const migrationsPath = path.relative(process.cwd(), payload.db.migrationDir);

    let migrations = await payload.find({ collection: MIGRATIONS_COLLECTION });
    let module = await import(`${migrationsPath}?update=${Date.now()}`);

    // Check if there's more than onne migration in DB
    if(migrations.totalDocs <= 1 && module.migrations.length == 1) {
        payload.logger.warn('No need to regenerate migrations')
        return;
    }

    // Apply all mending migration
    await payload.db.migrate(); 

    // Delete migrations and generate new init migration
    deleteFilesByExtensionsSync(payload, migrationsPath, [".ts", ".json"]);
    await payload.db.createMigration({
        payload,
        forceAcceptWarning: true,
        skipEmpty: true,
        migrationName: "init"
    });
    
    module = await import(`${migrationsPath}?update=${Date.now()}`);
    const migrationName = module.migrations[0].name;
    
    // Clear all migrations from DB and create new "init" record
    await payload.delete({
        collection: MIGRATIONS_COLLECTION,
        where: {}
    });

    await payload.create({
        collection: MIGRATIONS_COLLECTION,
        data: {
            name: migrationName,
            batch: 1
        }
    });
}

await main();