import path from "path";
import { ProjectInfo } from "./project.js";
import { exePath, FileInjectionItem, InjectionResult, JsonInjectionItem, ProgramCsSection, renderTemplate, updateEnvLoaderNextjs, UpdateEnvMjsVariables, updateEnvVariables, updateFile, updateJson, updateProgramCs, updateYaml, YamlInjectionItem } from "~/utils";
import { mergeAndConcat } from 'merge-anything';
import { TemplateId } from "~/config";
import { $ } from "execa";
import { content, divider, error } from "~/log";
import chalk from "chalk";
import "core-js/actual/object/group-by";
import { readdir } from "fs/promises";
import { cpSync, existsSync, lstatSync } from "fs";

export type UpdateInfo<T> = {
    // List of files which are added to project
    add?: string[];
    // Files which already exists in project, but will be modified
    modify?: string[];
    // Files which will be completely overwriten (changes will be lost)
    overwrite?: string[];
    // NPM packages which will be installed
    npmInstall?: string[];
    // Nuget packages which will be installed
    nugetInstall?: string[];
    // Options for particular addon
    options?: T
}

export type InstallOptions<T> = {
    targetPath: string;
    projectInfo: ProjectInfo;
    options: T
}

export type AddonPromptFunction<T> = (options?: T) => boolean;

type AddonTaskResults<T, Q> = {
    type: string;
    info?: UpdateInfo<T> | null | undefined;
    result?: Q;
    skip?: boolean;
}

type VariableResolverParams<T> = {
    dotnetCwd(): string,
    dotnetName(): string,
    dotnetNs(libName: string): string,
    dotnetLibTarget(libName: string): string,
    projectInfo: ProjectInfo, 
    options: T
}

type VariableResolverFunc<T, Q> = (params: VariableResolverParams<T>) => Q | Promise<Q | undefined | null> | undefined | null

type VariableResolver<T, Q> = VariableResolverFunc<T, Q> | Q | undefined | null

class AddonTask<T> {
    #type: string;
    #info?: UpdateInfo<T> | null | undefined;
    #result?: any;
    #skip?: boolean;

    #preinstall?: (projectInfo: ProjectInfo, options?: T) => Promise<UpdateInfo<T> | undefined | null> | UpdateInfo<T> | undefined | null;
    #install?: (projectInfo: ProjectInfo, options?: T) => Promise<any>;
    #postinstall?: (projectInfo: ProjectInfo, options?: T) => Promise<any>;

    constructor(type: string, preinstall?: (projectInfo: ProjectInfo, options?: T) => Promise<UpdateInfo<T> | undefined | null> | UpdateInfo<T> | undefined | null, install?: (projectInfo: ProjectInfo, options?: T) => Promise<any>, postinstall?: (projectInfo: ProjectInfo, options?: T) => Promise<any>) {
        this.#type = type;
        this.#preinstall = preinstall;
        this.#install = install;
        this.#postinstall = postinstall;
    }

    getType() {
        return this.#type;
    }

    getSkip() {
        return this.#skip;
    }

    setSkip(skip?: boolean) {
        this.#skip = skip;
    }

    getInfo() {
        return this.#info;
    }

    async preinstall(projectInfo: ProjectInfo, options?: T) {
        return this.#info = await this.#preinstall?.(projectInfo, options);
    }

    async install(projectInfo: ProjectInfo, options?: T) {
        return this.#result = await this.#install?.(projectInfo, options);
    }

    async postinstall(projectInfo: ProjectInfo, options?: T) {
        return this.#postinstall = await this.#postinstall?.(projectInfo, options);
    }

    results() {
        return {
            skip: this.#skip,
            type: this.#type,
            info: this.#info,
            result: this.#result
        } as AddonTaskResults<T, any>
    }

    static castResults<T, Q>(results: AddonTaskResults<T, any>[]) {
        return results as AddonTaskResults<T, Q>[];
    }
}

export class AddonInstaller<T> {
    #cwd?: string;
    #tasks: AddonTask<T>[] = [];
    #prompt?: (projectInfo: ProjectInfo) => Promise<T>;
    #options?: T;

    async #resolveVariable<Q>(projectInfo: ProjectInfo, variable: VariableResolver<T, Q>) {
        const projectName = projectInfo.name.replace(".client", "");

        const resolved = typeof variable === 'function' ? await (variable as VariableResolverFunc<T, Q>)({ 
            dotnetCwd: () => {
                return path.join("./../", `${projectName}.Server`)
            },
            dotnetName: () => projectName,
            dotnetNs: (libName: string) => {
                const camelize = (s: string) => s.replace(/-./g, x=>x[1].toUpperCase());
                const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);
                const namespace = `${capitalize(camelize(projectName))}.Lib.${libName}`;
                return namespace;
            },
            dotnetLibTarget: (libName: string) => {
                return path.join("./../", `${projectName}.Server`, "Lib", libName);
            },
            projectInfo, 
            options: this.#options ?? {} as T
        }) : variable;

        return resolved;
    }

    #assertIsDefined<K>(val: K, check?: (val: NonNullable<K>) => boolean) : asserts val is NonNullable<K> {
        if (val === undefined || val === null) {
            throw `Expected 'val' to be defined, but received ${val}`;
        }

        if(check && !check(val)) {
            throw `Expected 'val' to satisfy additional rule check. Recieved ${val}`
        }
    }

    setCwd(cwd: string) {
        this.#cwd = cwd;
    }

    addPrompt(prompt: (projectInfo: ProjectInfo) => Promise<T>) {
        this.#prompt = prompt;
        return this;
    }

    addUpdateEnvVariables(fileName: string, variables: VariableResolver<T, string[]>) {
        this.#tasks.push(new AddonTask<T>('env-variables', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, variables);
            this.#assertIsDefined(resolved, x => x.length != 0);

            return {
                modify: [fileName]
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, variables);
            this.#assertIsDefined(resolved);

            return await updateEnvVariables(path.join(this.#cwd!, fileName), resolved);
        }))

        return this;
    }

    addRenderTemplate(templateDir: string, templateFile: string, targetPath: VariableResolver<T, string>, context?: VariableResolver<T, object>) {
        this.#tasks.push(new AddonTask<T>('render-template', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, targetPath);
            this.#assertIsDefined(resolved);

            return {
                add: [resolved]
            }
        }, async (projectInfo) => {
            const resolvedPath = await this.#resolveVariable(projectInfo, targetPath);
            const contextContext = await this.#resolveVariable(projectInfo, context);
            this.#assertIsDefined(resolvedPath);

            return await renderTemplate(this.#cwd!, templateDir, templateFile, resolvedPath, contextContext);
        }));
        
        return this;
    }

    addCopyFiles(sourcePath: string, targetPath: VariableResolver<T, string>) {
        this.#tasks.push(new AddonTask<T>('copy-files', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, targetPath);
            this.#assertIsDefined(resolved);

            const absoluteSourcePath = path.join(exePath, sourcePath);
            const files = lstatSync(absoluteSourcePath).isDirectory() ? 
                (await readdir(absoluteSourcePath, { recursive: true, withFileTypes: true }))
                    .filter(x => x.isFile())
                    .map(x => path.join(resolved, path.relative(absoluteSourcePath, path.join(x.parentPath, x.name)))) 
                : [resolved];

            return {
                add: files
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, targetPath);
            this.#assertIsDefined(resolved);

            const cwd = this.#cwd as string;
            const source = path.join(exePath, sourcePath);
            const target = path.join(this.#cwd!, resolved);
            const copy: string[] = [];
            const skip: string[] = [];

            cpSync(source, target, {
                recursive: true,
                filter(itemSourcePath, itemTargetPath) {
                    const normalizePath = (filePath: string) => {
                        return filePath.startsWith('\\\\?\\') ? filePath.substring(4) : filePath;
                    };

                    if(existsSync(itemTargetPath) && lstatSync(itemTargetPath).isFile()) {
                        skip.push(path.relative(cwd, normalizePath(itemTargetPath)));
                        return false;
                    }

                    if(lstatSync(itemSourcePath).isFile()) {
                        copy.push(path.relative(cwd, normalizePath(itemTargetPath)));
                    }
                    
                    return true;
                },
            });

            return { copy, skip };
        }));
        
        return this;        
    }

    addUpdateYaml(fileName: string, variables: VariableResolver<T, string[]>) {
        this.#tasks.push(new AddonTask<T>('yaml-pipeline', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, variables);
            this.#assertIsDefined(resolved, x => x.length != 0);

            return {
                modify: [fileName]
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, variables);
            this.#assertIsDefined(resolved);

            return await updateYaml(path.join(this.#cwd!, fileName), resolved);
        }));

        return this;
    }

    addUpdateEnvMjs(fileName: string, variables: VariableResolver<T, UpdateEnvMjsVariables>) {
        this.#tasks.push(new AddonTask<T>('env-mjs', async (projectInfo) => {
            const resolved = await this.#resolveVariable<UpdateEnvMjsVariables>(projectInfo, variables);
            this.#assertIsDefined(resolved, x => x.processEnv.length != 0 || x.server.length != 0);

            return {
                modify: [fileName]
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable<UpdateEnvMjsVariables>(projectInfo, variables);
            this.#assertIsDefined(resolved);

            return await updateEnvLoaderNextjs(path.join(this.#cwd!, fileName), resolved);
        }))

        return this;        
    }

    addUpdateProgramCs(fileName: VariableResolver<T, string>, injections: VariableResolver<T, { section: ProgramCsSection, value: string }[]>) {
        this.#tasks.push(new AddonTask<T>('update-program-cs', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, fileName);
            this.#assertIsDefined(resolved);

            return {
                modify: [resolved]
            } 
        }, async (projectInfo) => {
            const resolvedPath = await this.#resolveVariable(projectInfo, fileName);
            const resolvedInjections = await this.#resolveVariable(projectInfo, injections);
            this.#assertIsDefined(resolvedPath);
            this.#assertIsDefined(resolvedInjections);

            return await updateProgramCs(path.join(this.#cwd!, resolvedPath), resolvedInjections);
        }));

        return this;        
    }

    addUpdateJson(fileName: VariableResolver<T, string>, object: VariableResolver<T, object>) {
        this.#tasks.push(new AddonTask<T>('update-json', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, fileName);
            this.#assertIsDefined(resolved);

            return {
                modify: [resolved]
            } 
        }, async (projectInfo) => {
            const resolvedPath = await this.#resolveVariable(projectInfo, fileName);
            const resolvedObject = await this.#resolveVariable(projectInfo, object);
            this.#assertIsDefined(resolvedPath);
            this.#assertIsDefined(resolvedObject);

            return await updateJson(path.join(this.#cwd!, resolvedPath), resolvedObject);
        }));

        return this;
    }

    addInstallNpm(packages: VariableResolver<T, string[]>, dev?: boolean) {
        this.#tasks.push(new AddonTask<T>('npm-install', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, packages);
            this.#assertIsDefined(resolved, x => x.length != 0);

            return {
                npmInstall: resolved
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, packages);
            this.#assertIsDefined(resolved);

            if(dev) {
                await $({ cwd: this.#cwd, stdout: 'inherit' })`yarn add ${[...resolved]} -D`;
            } else {
                await $({ cwd: this.#cwd, stdout: 'inherit' })`yarn add ${[...resolved]}`;
            }
            
            return true;
        }));

        return this;
    }

    addInstallNuget(packages: VariableResolver<T, string[]>) {
        this.#tasks.push(new AddonTask<T>('nuget-install', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, packages);
            this.#assertIsDefined(resolved, x => x.length != 0);

            return {
                nugetInstall: resolved
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, packages);
            this.#assertIsDefined(resolved);

            const projectName = projectInfo.name.replace(".client", "");
            const dotnetCwd = path.join("./../", `${projectName}.Server`);

            for(const pkg of resolved) {
                // NOTE: to escape quoting string needs to be without spacing and passed as array
                await $({ cwd: path.join(this.#cwd!, dotnetCwd), stdout: 'inherit' })`dotnet add package ${[...pkg.split(' ')]}`;
            }
            
            return true;
        }));

        return this;
    }

    addRunCommand(command: VariableResolver<T, string>) {
        this.#tasks.push(new AddonTask<T>('command-run', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, command);
            this.#assertIsDefined(resolved);

            return {}
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, command);
            this.#assertIsDefined(resolved);

            await $({ cwd: this.#cwd, stdout: 'inherit' })`${resolved}`;
            return true;
        }));

        return this;
    }

    addModifyFile(fileName: string, lines: VariableResolver<T, string[]>, mode: "append" | "prepend") {
        this.#tasks.push(new AddonTask<T>('modify-file', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, lines);
            this.#assertIsDefined(resolved);

            return {
                modify: [fileName]
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, lines);
            this.#assertIsDefined(resolved);

            return await updateFile(path.join(this.#cwd!, fileName), resolved, mode);
        }));

        return this;
    }

    addModifyCustomFile(fileName: VariableResolver<T, string>, func: (fileName: string) => InjectionResult<FileInjectionItem> | Promise<InjectionResult<FileInjectionItem>>) {
        this.#tasks.push(new AddonTask<T>('modify-custom-file', async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, fileName);
            this.#assertIsDefined(resolved);

            return {
                modify: [resolved]
            }
        }, async (projectInfo) => {
            const resolved = await this.#resolveVariable(projectInfo, fileName);
            this.#assertIsDefined(resolved);

            return await func(path.join(this.#cwd!, resolved));
        }));

        return this;
    }

    addFooter(func: (projectInfo: ProjectInfo, options?: T) => void | Promise<() => void>) {
        this.#tasks.push(new AddonTask<T>('void', undefined, undefined, async (projectInfo) => {
            await func(projectInfo, this.#options);
        }));

        return this;
    }

    async preinstall(projectInfo: ProjectInfo) {
        // Runs preinstall prompts
        this.#options = await this.#prompt?.(projectInfo);
        
        for(const task of this.#tasks) {
            try {
                await task.preinstall(projectInfo, this.#options);
            }
            catch(ex) {
                task.setSkip(true);
            }
        }

        const eachStepInfo = this.#tasks.filter(f => !f.getSkip() && f.getInfo()).map(x => x.getInfo());
        const wholeInstallInfo = mergeAndConcat({}, ...eachStepInfo) as UpdateInfo<T>;
        
        if(Object.keys(wholeInstallInfo).length == 0) {
            return null;
        }

        // Remove duplicates
        Object.keys(wholeInstallInfo).forEach(key => {
            const prop = wholeInstallInfo as Record<string, any>;
            if(Array.isArray(prop[key])) {
                (wholeInstallInfo as Record<string, any>)[key] = [... new Set(prop[key])]
            }
        });


        return wholeInstallInfo;
    }

    async run(projectInfo: ProjectInfo) {
        const functionsToRun = this.#tasks.filter(x => !x.getSkip());

        // Run addon installation steps
        for(const func of functionsToRun) {
            await func.install?.(projectInfo, this.#options);
        }

        this.printReport();

        // Run postinstall scripts
        for(const func of functionsToRun) {
            await func.postinstall?.(projectInfo, this.#options);
        }
    }

    async printReport() {
        // Collect installation results
        const functionsToRun = this.#tasks.filter(x => !x.getSkip());
        const results = functionsToRun.map(x => x.results());

        
        const print = <Q extends FileInjectionItem | YamlInjectionItem | JsonInjectionItem>(name: string, type: string, format: (injection: Q) => string) => {
            const injections = AddonTask.castResults<T, InjectionResult<Q>>(results.filter(x => x.type == type)); 
            const injectionsByFile = Object.groupBy(injections, x => x.info!.modify![0]);

            for(const file of Object.keys(injectionsByFile)) {
                const merged = mergeAndConcat([], ...injectionsByFile[file]?.map(x => x.result) ?? []) as InjectionResult<Q>;
                content(`${name} already existed in ${file} file (not modified)`, merged.skipped.map(t => format(t)), chalk.hex('#ed6c02'));
                content(`${name} added to ${file} file`, merged.transformations.map(t => format(t)));    
            }
        }

        // Print files copied
        const renderTemplate = results.filter(x => x.type == "render-template");
        const copyFiles = AddonTask.castResults<T, { skip: string[], copy: string[] }>(results.filter(x => x.type == "copy-files"));
        content(`files already existed (not modified)`, [...renderTemplate.filter(x => !x.result).flatMap(x => x.info?.add).filter(x => x), ...copyFiles.flatMap(x => x.result?.skip)].map(x => x?.replaceAll('\\', '/')) as string[], chalk.hex('#ed6c02'));
        content(`files copied`, [...renderTemplate.filter(x => x.result).flatMap(x => x.info?.add).filter(x => x), ...copyFiles.flatMap(x => x.result?.copy)].map(x => x?.replaceAll('\\', '/')) as string[]);

        // Print env variables added to .env files
        print<FileInjectionItem>("env variables", "env-variables", t => `(Line: ${t.line}${t.section ? `, ${t.section}` : ''}) ${t.value.trim()}`);
        print<FileInjectionItem>("env variable schema", "env-mjs", t => `(Line: ${t.line}${t.section ? `, ${t.section}` : ''}) ${t.value.trim()}`);
        print<YamlInjectionItem>("variable", "yaml-pipeline", t => `(Argument: ${t.name}) ${t.value.trim()}`);
        print<FileInjectionItem>("lines", "update-program-cs", t => `(Line: ${t.line}${t.section ? `, ${t.section}` : ''}) ${t.value.trim()}`);
        print<JsonInjectionItem>("properties", "update-json", t => `(Path: ${t.path}) ${t.value.trim()}`);
        print<FileInjectionItem>("lines", "modify-file", t => `(Line: ${t.line}${t.section ? `, ${t.section}` : ''}) ${t.value.trim()}`);
        print<FileInjectionItem>("lines", "modify-custom-file", t => `(Line: ${t.line}${t.section ? `, ${t.section}` : ''}) ${t.value.trim()}`);

        // Npm install
        const npmInstall = AddonTask.castResults<T, boolean>(results.filter(x => x.type == "npm-install"));
        const installedPackages = npmInstall.filter(x => x.result && !x.skip).flatMap(x => x.info!.npmInstall) as string[];
        content(`npm packages installed`, installedPackages);

        const isAnyEnvVariableAdded = AddonTask.castResults<T, InjectionResult<FileInjectionItem>>(results.filter(x => x.type == "env-variables")).some(x => x.result?.transformations && x.result?.transformations.length > 0);
        if(isAnyEnvVariableAdded) {
            divider();
            error('New environment variables have been added to .env.example. Please make sure to manually add them to your .env file.', 'Attention', true);    
        }
    }
}

export class AddonBase {
    #name: string;
    #installers = new Map<TemplateId, AddonInstaller<any>>();

    constructor(name: string) {
        this.#name = name;
    }

    addInstaller(template: TemplateId, installer: AddonInstaller<any>) {
        this.#installers.set(template, installer);
        return this;
    }

    #getInstaller(projectInfo: ProjectInfo) {
        const template = projectInfo.type;
        const installer = this.#installers.get(template);
        if(!installer) {
            throw 'addon installer not found'
        }

        installer.setCwd(projectInfo.path);
        return installer;
    }

    getName() {
        return this.#name;
    }

    async getUpdateInfo(projectInfo: ProjectInfo) {
        const installer = this.#getInstaller(projectInfo);
        return await installer.preinstall(projectInfo);
    }

    async install(options: InstallOptions<any>) {
        const installer = this.#getInstaller(options.projectInfo);
        await installer.run(options.projectInfo);
    }
}