import fs from "fs";
import { resolve } from "path";
import * as TJS from "typescript-json-schema";

// ---------- Settings and Compiler Options ----------
const outputPath = "./src/plugins/payload-oapi/openapi.json";
const settings: TJS.PartialArgs = {
  required: true,
  ignoreErrors: true,
};

const compilerOptions: TJS.CompilerOptions = {
  strictNullChecks: true,
};

// Base directory for your project (adjust if necessary)
const basePath = "./";

const filePath = resolve("src/payload-types.ts");

// Create a TypeScript program from your file(s)
const program = TJS.getProgramFromFiles([filePath], compilerOptions, basePath);

const getSchemaFromTypescriptFile = (interfaceName: string | "*") => {
  const schema = TJS.generateSchema(program, interfaceName, settings);
  return schema;
};

// We could run the generation here to preload it instead
// const run = async () => {
//   const payload = await getPayloadWithConfig();
//   const plugins = payload.config.plugins.map((x) => x.name);
//   console.log("PLUGINS", plugins);
// };
// await run();

const schema = getSchemaFromTypescriptFile("*");
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
console.log(`Schema written to ${outputPath}`);
