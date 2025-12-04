import { readFileSync, writeFileSync } from "fs";
import { AddonBase, AddonInstaller } from "~/lib/addons";
import * as acorn from "acorn"
import * as walk from 'acorn-walk';
import * as astring from 'astring';
import { FileInjectionItem, InjectionResult } from "~/utils";

const configureTailwind = async (configPath: string, content: string[]) => {
    const missing: string[] = [];
    let line = 0;

    const tailwindConfig = readFileSync(configPath).toString();
    const ast = acorn.parse(tailwindConfig, { ecmaVersion: "latest", sourceType: "module", locations: true });
    walk.simple(ast, {
        Property(_node) {
            if(_node.key.type == "Identifier" && (_node.key as acorn.Identifier).name == 'content') {
                const value = _node.value as acorn.ArrayExpression;
                line = _node.loc?.end.line ?? 0;

                // Finds missing values
                missing.push(...content.filter(x => (value.elements as acorn.Literal[]).findIndex((a) => a.value == x) == -1));
                value.elements.push(...missing.map(x => ({ type: 'Literal', value: x } as acorn.Literal)));
            }
        }
    });

    if(missing.length > 0) {
        writeFileSync(configPath, astring.generate(ast));
    }

    const skipped = content.filter(x => !missing.includes(x));

    return {
        transformations: missing.length > 0 ? [{
            line,
            value: missing.join(", ")
        }] : [],
        skipped: skipped.length > 0 ? [{
            line,
            value: skipped.join(", ")
        }] : []
    } as InjectionResult<FileInjectionItem>
}

const nextjs = new AddonInstaller<any>()      
    .addInstallNpm(['tailwindcss', 'postcss', 'autoprefixer'], true)
    .addRunCommand('yarn dlx tailwindcss init -p')
    .addModifyFile('src/app/globals.css', ["@tailwind base;", "@tailwind components;", "@tailwind utilities;"], "prepend")
    .addModifyCustomFile("tailwind.config.js", async (file) => {
        return await configureTailwind(file, [
            "./app/**/*.{js,ts,jsx,tsx,mdx}", 
            "./pages/**/*.{js,ts,jsx,tsx,mdx}",
            "./components/**/*.{js,ts,jsx,tsx,mdx}"
        ]);
    })
    .addCopyFiles("assets/tailwind_example.tsx", "src/app/tailwind/page.tsx");

const dotnet = new AddonInstaller<any>()
    .addInstallNpm(['tailwindcss', 'postcss', 'autoprefixer'], true)
    .addRunCommand('yarn dlx tailwindcss init -p')
    .addModifyFile('src/index.css', ["@tailwind base;", "@tailwind components;", "@tailwind utilities;"], "prepend")
    .addModifyCustomFile("tailwind.config.js", async (file) => {
        return await configureTailwind(file, [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}"
        ]);
    })
    .addCopyFiles("assets/tailwind_example.tsx", "src/tailwind_example.tsx");

export default new AddonBase('tailwind').addInstaller("nextjs", nextjs).addInstaller("dotnet", dotnet);