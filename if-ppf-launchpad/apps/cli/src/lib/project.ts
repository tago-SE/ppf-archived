import { readFileSync } from "fs";
import path from "path";
import { TemplateId, templates } from "~/config";

export enum ProjectType {
    dotnet,
    nextjs
}

export type ProjectInfo = {
    version: string; 
    name: string;
    type: TemplateId;
    path: string;
}

export function getProjectInfo(targetPath: string) {
    const packageJson = JSON.parse(readFileSync(path.join(targetPath, "package.json"), "utf8"));
    if(!packageJson.ppf) {
        throw "not a ppf project";
    }

    if(!templates[packageJson.ppf.type as TemplateId]) {
        throw "unrecognized project type";
    }

    return {
        name: packageJson.name,
        version: packageJson.ppf.version,
        type: packageJson.ppf.type as TemplateId,
        path: targetPath
    } as ProjectInfo;
}