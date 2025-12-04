import chalk from "chalk";
import { renameSync } from "fs";
import { glob } from "glob";
import path, { basename } from "path";
import { replaceInFile } from 'replace-in-file';
import { CreateProjectOptions, Template } from "~/lib/templates";
import { copyTemplate, getPaths } from "~/utils";

export default {
    getTemplateInfo: async () => {
        return {
            name: "dotnet"
        }
    },
    create: async (options: CreateProjectOptions) => {
        const { sourceDir, targetDir, targetBaseDir } = getPaths(options.projectName, "dotnet");
        const files = await copyTemplate({ sourceDir, targetDir, targetBaseDir });
        console.log(`${chalk.gray('|')} ${files.length} filed coppied to target directory`);

        // Rename files
        const filesToRename = await glob('**/*dotnet.[client|Server]*', {
            cwd: targetDir,
            nodir: true
        });

        filesToRename.forEach(x => {
            const fileName = basename(x);
            const newFileName = fileName.replace('dotnet', options.projectName);
            const newPath = x.replace(fileName, newFileName);
            renameSync(path.join(targetDir, x), path.join(targetDir, newPath));
        });

        // Rename project directories
        renameSync(path.join(targetDir, "dotnet.client"), path.join(targetDir, `${options.projectName}.client`));
        renameSync(path.join(targetDir, "dotnet.Server"), path.join(targetDir, `${options.projectName}.Server`));

        console.log(`${chalk.gray('|')} project structure renamed`);

        // Update .sln
        await replaceInFile({
            files: path.join(targetDir, `${options.projectName}.sln`),
            from: /dotnet/g,
            to: options.projectName,
        });

        console.log(`${chalk.gray('|')} .sln updated`);

        // Update Server project
        await replaceInFile({
            files: path.join(targetDir, `${options.projectName}.Server`, `${options.projectName}.Server.csproj`),
            from: /dotnet/g,
            to: options.projectName,
        });

        console.log(`${chalk.gray('|')} server project updated`);

        // Update package.json
        await replaceInFile({
            files: path.join(targetDir, `${options.projectName}.client`, 'package.json'),
            from: /dotnet.client/g,
            to: `${options.projectName}.client`
        });

        console.log(`${chalk.gray('|')} package.json updated`);

        return {
            targetDir,
            nextSteps: [
                `cd ${options.projectName}/${options.projectName}.client`,
                !options.installDependencies ? 'yarn install' : undefined,
                'yarn dev'
            ].filter(x => !!x)
        }
    }
} as Template;