import path from "path";
import { copyFiles } from "./utils";
import { existsSync, rmSync } from "fs";

// NODE: THIS file is bor CLI build and is not part of CLI itself.
async function copyNextjsTemplate() {
    const source = path.join(process.cwd(), "./../nextjs/");
    const destination = path.join(process.cwd(), "./dist/nextjs/");
    if(existsSync(destination)) {
        rmSync(destination, { recursive: true, force: true });
    }

    await copyFiles(
        source, 
        destination
    );
}

async function copyDotnetTemplate() {
    const source = path.join(process.cwd(), "./../dotnet/");
    const destination = path.join(process.cwd(), "./dist/dotnet/");
    if(existsSync(destination)) {
        rmSync(destination, { recursive: true, force: true });
    }

    await copyFiles(
        source, 
        destination, 
        ["dotnet.client/**"]
    );
}

async function copyAssets() {
    const source = path.join(process.cwd(), "./assets/");
    const destination = path.join(process.cwd(), "./dist/assets/");
    if(existsSync(destination)) {
        rmSync(destination, { recursive: true, force: true });
    }
    
    await copyFiles(
        source, 
        destination
    );
}

await copyNextjsTemplate();
await copyDotnetTemplate();
await copyAssets();