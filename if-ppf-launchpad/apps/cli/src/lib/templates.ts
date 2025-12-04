import { TemplateId } from "~/config";

export type TemplateInfo = {
    name: TemplateId;
    // NOTE: configurable base template? If so then should add more props here
}

export type CreateProjectOptions = {
    projectName: string,
    installDependencies?: boolean
}

export type Template = {
    getTemplateInfo: () => Promise<TemplateInfo>;
    create: (options: CreateProjectOptions) => Promise<{ targetDir: string, nextSteps: string[] }>;
}