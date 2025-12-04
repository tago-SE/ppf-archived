import path from "path";
import { CreateProjectOptions, Template } from "~/lib/templates";
import { replaceInFile } from 'replace-in-file';
import { copyTemplate, getPaths } from "~/utils";
import chalk from "chalk";

export default {
    getTemplateInfo: async () => {
        return {
            name: "nextjs"
        }
    },
    create: async (options: CreateProjectOptions) => {
        const { sourceDir, targetDir, targetBaseDir } = getPaths(options.projectName, "nextjs");
        const files = await copyTemplate({sourceDir, targetBaseDir, targetDir});
        console.log(`${chalk.gray('|')} ${files.length} filed coppied to target directory`);

        // Updates package.json
        await replaceInFile({
            files: path.join(targetDir, 'package.json'),
            from: 'if-ppf-nextjs-template',
            to: options.projectName
        });

        console.log(`${chalk.gray('|')} package.json updated`);

        return {
            targetDir,
            nextSteps: [
                `cd ${options.projectName}`,
                !options.installDependencies ? 'yarn install' : undefined,
                'yarn dev'
            ].filter(x => !!x)
        }
    }
} as Template;