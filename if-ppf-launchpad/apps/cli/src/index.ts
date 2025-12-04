import chalk from 'chalk';
import { Command } from 'commander';
import { input, select, confirm } from '@inquirer/prompts';
import { AddonId, addons, TemplateId, templates } from './config';
import { isDev } from './utils';
import path from 'path';
import { congrats, content, divider, error, footer, header, section } from './log';
import { existsSync, writeFileSync } from 'fs';
import { getProjectInfo } from './lib/project';
import { $ } from 'execa';

const program = new Command();

const echo = console.log;

program
  .name('if ppf')
  .description('CLI to If PPF')
  .version('1.0.0');

// Creates new project from template
program.command('create')
    .description('Creates new project from template')
    .argument('<template>', 'name of the template')
    .action(async (template: TemplateId) => {
        const templ = templates[template];
        if(!templ) {
            error('unrecognized template');
            return;
        }

        const info = await templ.getTemplateInfo();

        header('Creating Project', info.name, 'Create ${name} app?');
        
        try {
            divider();
            const projectName = await input({ message: 'Name of the project', default: `ppf-${info.name}-project`, required: true });
            const installDependencies = await confirm({ message: 'Would you like to install yarn dependencies?' });
            const isUserConfirmed = await confirm({message: `Ready to create the ${chalk.magentaBright(info.name)} project?`});

            if(isUserConfirmed) {
                divider();
                section('Creating Project', chalk.magentaBright(info.name));

                const result = await templ.create?.({
                    projectName,
                    installDependencies
                });

                if(installDependencies) {
                    const projectPath = info.name == 'dotnet' ? path.join(result.targetDir, `${projectName}.client`) : result.targetDir;
                    const yarnLockPath = path.join(projectPath, "yarn.lock");
                    if(!existsSync(yarnLockPath)){
                        writeFileSync(yarnLockPath, "");
                    }

                    await $({ cwd: projectPath, stdout: 'inherit' })`yarn install`;
                }
    
                section('App created', chalk.magentaBright(projectName));
                divider();
                section('Next steps');

                result.nextSteps.forEach(x => {
                    echo(`${chalk.gray('|')} ${x}`);
                })
                congrats();
            } else {  
                divider();
                footer();
            }
        }
        catch(ex: any) {
            if(ex.name === 'ExitPromptError') {
                return;
            }

            throw ex;
        }
    });

// Adds new feature to project
program.command('add')
    .description('Adds feature to the project')
    .argument('<feature>', 'name of the feature')
    .action(async (feature: AddonId) => {
        try {
            // Validates addon
            const addon = addons[feature];
            if(!addon) {
                error('unrecognized addon');
                return;
            }

            // For DEV only
            let overridePath: string | undefined = undefined;
            if(isDev) {
                overridePath = path.join(process.cwd(), ".tmp", await select({
                    message: `${chalk.bgRed(' DEV ONLY ')} which template to use?`,
                    choices: [{
                        value: "ppf-dotnet-project/ppf-dotnet-project.client",
                        name: "dotnet"
                    }, {
                        value: "ppf-nextjs-project",
                        name: "nextjs"
                    }],
                    default: 0,
                    loop: true
                }));
                divider();
            }

            // Determines project type
            const targetPath = overridePath ?? process.cwd();
            const projectInfo = getProjectInfo(targetPath);
            
            const name = addon.getName();

            header('Add Integration', name, 'Add ${name} to your app?');

            const info = await addon.getUpdateInfo(projectInfo);
            if(!info) {
                divider();
                error('Nothing to install', 'Exiting');
                return;
            }

            content('Add', info.add?.map(x => x.replaceAll('\\', '/')));
            content('Modify', info.modify?.map(x => x.replaceAll('\\', '/')));   
            content('Overwrite', info.overwrite?.map(x => x.replaceAll('\\', '/')));
            content('Install yarn packages', info.npmInstall);
            content('Install Nuget packages', info.nugetInstall);

            divider();
            const isUserConfirmed = await confirm({ message: `Ready to apply the ${chalk.magentaBright(name)} updates to your app?` });
            if(isUserConfirmed) {
                divider();
                section('Adding Integration', chalk.magentaBright(name));

                // TODO: move to utils, create empty yarn.lock - this is neede for DEV, but might be usefull for prod as well. Allows to install packages even if project is inside monorepo
                const yarnLockPath = path.join(targetPath, "yarn.lock");
                if(!existsSync(yarnLockPath)){
                    writeFileSync(yarnLockPath, "");
                }

                await addon.install?.({ targetPath, projectInfo, options: info.options });

                divider();
                congrats();
            } else {  
                divider();
                footer();
            }
        } catch(ex: any) {
            if(ex.name === 'ExitPromptError') {
                return;
            }

            error(ex?.toString());
            throw ex;
        }
    });

// Checks if all features are up-to-date
program.command('check')
    .description('Check for updates for added features')
    .action(() => {

    });

program.parse();