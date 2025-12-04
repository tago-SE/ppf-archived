import { mkdir, readFile } from "fs/promises";
import { globifyGitIgnore } from "globify-gitignore";
import { glob } from "glob";
import path from "path";
import copy from "recursive-copy";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { TemplateId } from "./config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as acorn from "acorn"
import * as walk from 'acorn-walk';
import * as dotprop from 'dot-prop';
import { v4 as uuidv4 } from 'uuid';
import YAML, { Scalar } from 'yaml';
import { Eta } from "eta";

export const isDev = process.env.NODE_ENV != 'production';

export const exePath = isDev ? process.cwd() : import.meta.dirname;

export async function copyFiles(sourceDir: string, targetDir: string, additionalIgnore?: string[]) {
    // Lists all .gitignore files
    const gitIgnoreFiles = await glob('**/*.gitignore', {
        cwd: sourceDir,
        nodir: true,
        dot: true
    });

    // Build glob ignore by transforming rules and merging .gitignore files
    const globIgnores = (await Promise.all(gitIgnoreFiles.map(async x => {
        const baseStr = x.replace('.gitignore', '').replaceAll('\\', '/');
        const pathToIgnore = path.join(sourceDir, baseStr, ".gitignore");
        const gitIgnoreBuff = await readFile(pathToIgnore);
        const globIgnore = await globifyGitIgnore(gitIgnoreBuff.toString(), path.dirname(pathToIgnore));

        globIgnore.forEach(x => {
            if(!x.glob.startsWith('**')) {
                x.glob = `**/${x.glob}`;
            }
        });

        if(baseStr && baseStr.length > 0) {
            globIgnore.forEach(x => {
                x.glob = `${baseStr}${x.glob}`
            });
        }

        return globIgnore
    }))).flatMap(x => x).map(x => !x.included ? x.glob : undefined).filter(x => !!x) as string[];
    
    // Lists all files to copy
    const filesToCopy = await glob("**", {
        ignore: globIgnores,
        cwd: sourceDir,
        nodir: true,
        dot: true
    });

    return await copy(sourceDir, targetDir, {
        filter: filesToCopy,
        dot: true,
        junk: true,
        overwrite: true,
    });
}

export function getDirname(url: string) {
    const __filename = fileURLToPath(url);
    const __dirname = dirname(__filename);
    return __dirname;
}

export function getPaths(projectName: string, template: TemplateId) {
    const __dirname = getDirname(import.meta.url);
    const targetBaseDir = isDev ? path.join(process.cwd(), '.tmp') :  process.cwd();
    const sourceDir = path.join(__dirname, isDev ? `./../../${template}` : `./${template}/`);
    const targetDir = path.join(targetBaseDir, projectName);

    return {
        sourceDir,
        targetDir,
        targetBaseDir
    }
}

export async function copyTemplate({ sourceDir, targetDir, targetBaseDir }: {sourceDir: string, targetBaseDir: string, targetDir: string}) {
    if(isDev && !existsSync(targetBaseDir)) {
        await mkdir(targetBaseDir);
    }
    
    if(!existsSync(targetDir)) {
        await mkdir(targetDir);
    }

    return await copyFiles(sourceDir, targetDir);
}

export type FileInjectionItem = {
    line: number,
    value: string,
    section: string,
    ref: string
}

export type JsonInjectionItem = {
    path: string,
    value: string
}

export type YamlInjectionItem = {
    name: string,
    value: string
}

export type TransformationResult = {
    lines: string[]
    transformations: FileInjectionItem[],
    skipped: FileInjectionItem[]
}

export type InjectionResult<T extends FileInjectionItem | JsonInjectionItem | YamlInjectionItem> = {
    transformations: T[],
    skipped: T[]
}

export enum ProgramCsSection {
    using,
    builder,
    app
}

export type UpdateEnvMjsVariables = { server: string[], processEnv: string[] }

// TODO: move this function to seperate file? A lib?
// Do injections in env.mjs file
export function updateEnvLoaderNextjs(filePath: string, variables: Record<string, string[]>) {
    const envVariables = readFileSync(filePath).toString();
    const ast = acorn.parse(envVariables, { ecmaVersion: "latest", sourceType: "module", locations: true });
    const regionsMap: { name: string, lineStart: number, lineEnd: number }[] = [];

    walk.simple(ast, {
        VariableDeclarator(_node) {
            if(_node.init) {
                const identifier = _node.id as acorn.Identifier;
                if(identifier && identifier.name == "server" || identifier.name == "client" || identifier.name == "processEnv") {
                    const objectExpression = identifier.name == "server" || identifier.name == "client" ? (_node.init as acorn.CallExpression).arguments[0] as acorn.ObjectExpression : _node.init  as acorn.ObjectExpression;
                    
                    regionsMap.push({
                        name: identifier.name,
                        lineStart: objectExpression.loc?.start.line!,
                        lineEnd: objectExpression.loc?.end.line!
                    })
                }
            }
        }
    });

    const lines = envVariables.split(/\r\n?|\n/);
    const lineMap = createLineMap(lines);
    const injectTasks = regionsMap.sort(x => x.lineStart).reverse().map(section => {
        const sectionVariables = variables[section.name];
        if(!sectionVariables) {
            return;
        }

        const injectItems = sectionVariables.map(v => ({ line: -2, lookup: v.split(':')[0], value: v }));
        const result = transformContent(lineMap, injectItems, {
            prevLineSuffix: ',',
            scope: {
                name: section.name,
                start: section.lineStart - 1,
                end: section.lineEnd - 1
            }
        });

        return {
            section: section.name,
            ...result
        }
    }).filter(x => x);

    const result = applyLineNumbers(lineMap, {
        transformations: injectTasks.flatMap(x=> x?.transformations) as FileInjectionItem[],
        skipped: injectTasks.flatMap(x=> x?.skipped) as FileInjectionItem[],
        lines: injectTasks[0]!.lines
    })

    if(result.transformations.length > 0) {
        writeFileSync(filePath, lineMap.map(l => l.value).join('\n'));
    }

    const injectioResult = {
        transformations: result.transformations,
        skipped: result.skipped
    } as InjectionResult<FileInjectionItem>;

    return injectioResult;
}

// Do injections in .env files
export function updateEnvVariables(envPath: string, variables: string[]) {
    let lines: string[] = [];
    if(existsSync(envPath)) {
        const env = readFileSync(envPath).toString();
        lines = env.split(/\r\n?|\n/);
    }

    // Append env variables
    const transformations = variables.map(v => ({ line: -2, value: v, lookup: v.split('=')[0] }));

    const lineMap = createLineMap(lines);
    const result = applyLineNumbers(lineMap, transformContent(lineMap, transformations));

    if(result.transformations.length > 0) {
        writeFileSync(envPath, result.lines.join('\n'));
    }

    const injectioResult = {
        transformations: result.transformations,
        skipped: result.skipped
    } as InjectionResult<FileInjectionItem>;

    return injectioResult;
}

// Do injections in json files
export function updateJson(jsonPath: string, object: any) {
    const content = readFileSync(jsonPath).toString();
    const json = JSON.parse(content);

    // Generates map of all property paths
    const tree = (object: any, parentKeys?: string[], map?: string[]) => {
        if(!map) { map = [] };
        if(!parentKeys) { parentKeys = [] };

        for(const key of Object.keys(object)) {
            const type = typeof object[key];
            if(type === 'string' ||
               type === 'number' ||
               type === 'boolean') {
                map.push([...parentKeys, key].join('.'))
            } else {
                tree(object[key], [...parentKeys, key], map)
            }
        }

        return map;
    }

    const paths = tree(object);

    // Only updates if theres not json property found
    const transformations: JsonInjectionItem[] = [];
    const skipped: JsonInjectionItem[] = [];
    for(const path of paths) {
        if(!dotprop.hasProperty(json, path)) {
            const value = dotprop.getProperty(object, path) as string;

            dotprop.setProperty(json, path, dotprop.getProperty(object, path));
            transformations.push({
                path,
                value
            });
        } else {
            const value = dotprop.getProperty(json, path) as string;
            skipped.push({
                path,
                value
            });
        }
    }

    // List of added, skipped properties
    if(transformations.length > 0) {
        writeFileSync(jsonPath, JSON.stringify(json, null, '\t'));
    }

    return {
        transformations,
        skipped
    } as InjectionResult<JsonInjectionItem>
}

// Do injections in Program.cs file
export function updateProgramCs(filePath: string, update: { section: ProgramCsSection, value: string }[]) {
    // Read Program.cs file
    const contentStr = readFileSync(filePath).toString();
    let lines = contentStr.split(/\r\n?|\n/);

    const indexMap = new Map<ProgramCsSection, number>([
        [ProgramCsSection.using, lines.findLastIndex(x => x.trim().startsWith('using')) == -1 ? -1 : lines.findLastIndex(x => x.trim().startsWith('using'))],
        [ProgramCsSection.builder, lines.findIndex(x => x.trim().startsWith('var builder'))],
        [ProgramCsSection.app, lines.findIndex(x => x.trim().startsWith('var app'))]
    ]);

    // Generate transofrmations
    const injectItems = update.map(u => ({ line: indexMap.get(u.section) as number, value: u.value, lookup: u.value.trim() }));

    const lineMap = createLineMap(lines);
    const result = applyLineNumbers(lineMap, transformContent(lineMap, injectItems));

    if(result.transformations.length > 0) {
        writeFileSync(filePath, result.lines.join('\r\n'));
    }

    return {
        transformations: result.transformations,
        skipped: result.skipped
    } as InjectionResult<FileInjectionItem>;
}

// Do injections in Yaml files
export function updateYaml(yamlPath: string, variables: string[]) {
    const content = readFileSync(yamlPath).toString();
    const ast = YAML.parseDocument(content);

    const transformations: YamlInjectionItem[] = [];
    const skipped: YamlInjectionItem[] = []; 
    
    YAML.visit(ast, {
        Pair(_, pair) {
            if (pair.key && (pair.key as Scalar).value === 'inlineScript') {
                const scriptNode = pair.value as Scalar;
                const value = scriptNode.value as string;
                const lines = value.split(/\r\n?|\n/) as string[];
                const startIndex = lines.findIndex(l => l.trim().startsWith('--set-env-vars'));
                let endIndex = startIndex + 1;

                if(startIndex == -1) {
                    return;
                }

                // Loop existing env variables
                const existingVariables: string[] = [];
                for(const line of lines.slice(startIndex + 1)) {
                    if(line.includes('=')) {
                        const envVar = line.split('=')[0].trim();
                        existingVariables.push(envVar);
                        endIndex++;
                    } else {
                        break;
                    }
                }

                const missingVariables = variables.filter(variable => existingVariables.findIndex(existing => existing == variable.split('=')[0]) == -1);
                skipped.push(...variables.filter(variable => existingVariables.findIndex(existing => existing == variable.split('=')[0]) > -1).map(v => ({
                    name: '--set-env-vars',
                    value: v
                })));

                let offset = 0;
                for(const variable of missingVariables) {
                    // Ensures line continuation
                    const prev = lines[endIndex + offset - 1];
                    if(!prev.endsWith('`')) {
                        lines[endIndex + offset - 1] = prev + ' `';
                    }

                    lines.splice(endIndex + offset, 0, variable);
                    transformations.push({
                        name: '--set-env-vars',
                        value: variable
                    });

                    offset++;
                }

                scriptNode.value = lines.join('\n');
            }
        }
    })

    const newYaml = YAML.stringify(ast, {
        lineWidth: 0,
        singleQuote: true
    });

    if(transformations.length > 0) {
        writeFileSync(yamlPath, newYaml);
    }
    

    const injectioResult = {
        transformations,
        skipped
    } as InjectionResult<YamlInjectionItem>

    return injectioResult;
}

export function updateFile(filePath: string, linesToAdd: string[], mode: "append" | "prepend") {
    const env = readFileSync(filePath).toString();
    const lines = env.split(/\r\n?|\n/);

    // Append env variables
    const transformations = linesToAdd.map(v => ({ line: mode == "append" ? -2 : -1, value: v, lookup: v.trim() }));

    const lineMap = createLineMap(lines);
    const result = applyLineNumbers(lineMap, transformContent(lineMap, transformations));

    if(result.transformations.length > 0) {
        writeFileSync(filePath, result.lines.join('\n'));
    }

    const injectioResult = {
        transformations: result.transformations,
        skipped: result.skipped
    } as InjectionResult<FileInjectionItem>;

    return injectioResult;
}

const insertIntoString = (str: string, index: number, value: string) => {
    return str.substring(0, index) + value + str.substring(index);
}

enum LineItemType {
    init,
    add,
    skip
}

function createLineMap(lines: string[]) {
    return lines.map(l => ({ value: l, type: LineItemType.init, ref: uuidv4() }));    
}

function transformContent(lineMap: { value: string, type: LineItemType, ref: string }[], transformations: { line: number, lookup: string, value: string }[], options?: { prevLineSuffix?: string, scope?: { start: number; end: number, name: string } }) {
    // Line -2 appends to end of string
    transformations.forEach(t => {
        if(t.line == -2) {
            t.line = Number.MAX_SAFE_INTEGER;
        }
    });

    // Start by injecting from below
    let lineOffset = 0;
    for(const t of transformations.sort(x => x.line)) {
        // Checks if line is laready present in file
        const existing = options?.scope ? 
            lineMap.slice(options.scope.start, options.scope.end).findIndex(l => l.value.trim().startsWith(t.lookup)) : 
            lineMap.findIndex(l => l.value.trim().startsWith(t.lookup));

        if(existing == -1) {
            const index = t.line == Number.MAX_SAFE_INTEGER ? 
                (options?.scope?.end ? (options.scope.end + lineOffset) : lineMap.length) : 
                (options?.scope?.start ? (options?.scope?.start + lineOffset + t.line + 1) : lineOffset + t.line + 1);

            const prev = lineMap[index - 1];
            if(options?.prevLineSuffix && prev && t.line > 0) {
                const endTrim = prev.value.trimEnd();
                if(!endTrim.endsWith(options.prevLineSuffix)) {
                    const lastNonWhiteChar = endTrim.length;
                    lineMap[index - 1].value = insertIntoString(prev.value, lastNonWhiteChar, options.prevLineSuffix)
                }
            }

            const prefLookupIndex = t.line == Number.MAX_SAFE_INTEGER ? index - 1 : index;
            const prefix = ' '.repeat(lineMap[prefLookupIndex]?.value.length - lineMap[prefLookupIndex]?.value.trimStart().length);
            const suffix = t.line < Number.MAX_SAFE_INTEGER ? (options?.prevLineSuffix ?? '') : '';
            lineMap.splice(index, 0, { value: prefix + t.value + suffix, type: LineItemType.add, ref: uuidv4() });
            lineOffset += 1;
        } else {
            lineMap[options?.scope?.start ? existing + options?.scope?.start : existing].type = LineItemType.skip;
        }
    }

    const scopedLineMap = options?.scope ? lineMap.slice(options.scope.start, options.scope.end + lineOffset + 1) : lineMap;
    return {
        lines: scopedLineMap.map(l => l.value),
        transformations: scopedLineMap.map((l) => {
            if(l.type == LineItemType.add) {
                return {
                    section: options?.scope?.name, 
                    value: l.value, 
                    line: 0,
                    ref: l.ref
                } as FileInjectionItem
            }
        }).filter(x => x),
        skipped: scopedLineMap.map((l) => {
            if(l.type == LineItemType.skip) {
                return {
                    section: options?.scope?.name,
                    value: l.value, 
                    line: 0,
                    ref: l.ref
                } as FileInjectionItem
            }
        }).filter(x => x),
    } as TransformationResult;
}

function applyLineNumbers(lineMap: { value: string, type: LineItemType, ref: string }[], result: TransformationResult) {
    result.transformations.forEach(t => {
        const line = lineMap.findIndex(x => x.ref == t.ref);
        t.line = line + 1;
    });

    result.skipped.forEach(t => {
        const line = lineMap.findIndex(x => x.ref == t.ref);
        t.line = line + 1;
    });

    return result;
}

export function renderTemplate(cwdPath: string, templateDirectoryPath: string, templateFilename: string, outputPath: string, options?: any) {
    const libPath = path.join(cwdPath, outputPath);

    if(existsSync(libPath)) {
        return null;
    }

    const templateDir = path.join(exePath, "assets", templateDirectoryPath)
    const eta = new Eta({ views: templateDir });

    const res = eta.render(path.join('./', templateFilename), { ...options });
    
    // Create folder structure if not exist
    const base = path.dirname(libPath);
    if(!existsSync(base)) { 
        mkdirSync(base, { recursive: true });
    }

    writeFileSync(libPath, res);

    return true;
}