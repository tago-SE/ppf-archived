import { confirm } from "@inquirer/prompts"
import chalk from "chalk"
import { AddonBase, AddonInstaller } from "~/lib/addons"
import { divider, error } from "~/log"
import terminalLink from 'terminal-link';
import { docsBaseUrl } from "~/consts";
import path from "path";

type NextJsAppinsightsOptions = {
    frontend?: boolean
    backend?: boolean
}

type DotnetAppinsightsOptions = {
    frontend?: boolean
    backend?: boolean
}

const name = 'appinsights';

export default new AddonBase(name)
    .addInstaller("nextjs", new AddonInstaller<NextJsAppinsightsOptions>()
        .addPrompt(async () => {
            divider();
            const frontend = await confirm({ message: `Do you want to add appinsights for ${chalk.magentaBright('frontend')}?` });
            const backend = await confirm({ message: `Do you want to add appinsights for ${chalk.magentaBright('backend')}?` });

            return {
                frontend,
                backend
            }
        })
        .addInstallNpm(({ options }) => {
            const packages: string[] = [];

            if(options?.frontend) {
                packages.push('@microsoft/applicationinsights-web', '@microsoft/applicationinsights-react-js', '@microsoft/applicationinsights-clickanalytics-js');
            }

            if(options?.backend) {
                packages.push('applicationinsights')
            }

            return packages;
        })
        .addUpdateEnvVariables(".env.example", async ({ options }) => {
            const variables: string[] = [];

            if(options?.frontend) {
                variables.push(
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=',
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_DISABLE_COOKIES=true'
                );
            }

            if(options?.backend) {
                variables.push(
                    'APPLICATIONINSIGHTS_CONNECTION_STRING=',
                    'APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING=false',
                    'APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING=false'
                );
            }

            return variables;
        })
        .addUpdateEnvMjs("src/env.mjs", async ( { options }) => {
            const processEnv: string[] = [];
            const server: string[] = [];

            if(options?.frontend) {
                processEnv.push(
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING: getEnv("NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING")',
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_DISABLE_COOKIES: toBoolean(getEnv("NEXT_PUBLIC_APPLICATIONINSIGHTS_DISABLE_COOKIES"))'  
                );

                server.push(
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional()',
                    'NEXT_PUBLIC_APPLICATIONINSIGHTS_DISABLE_COOKIES: z.boolean().optional().default(true)'
                );
            }

            if(options?.backend) {
                processEnv.push(
                    'APPLICATIONINSIGHTS_CONNECTION_STRING: getEnv("APPLICATIONINSIGHTS_CONNECTION_STRING")',
                    'APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING: toBoolean(getEnv("APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING"))',
                    'APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING: toBoolean(getEnv("APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING"))' 
                );

                server.push(
                    'APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional()',
                    'APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING: z.boolean().optional().default(false)',
                    'APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING: z.boolean().optional().default(false)' 
                );
            }

            return { processEnv, server }
        })
        .addUpdateYaml('portal-pipeline.yml', async ({ options }) => {
            const variables = [];

            if(options?.frontend) {
                variables.push('NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=secretref:appi-secret');
            }

            if(options?.backend) {
                variables.push(
                    'APPLICATIONINSIGHTS_CONNECTION_STRING=secretref:appi-secret',
                    'APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING=$(AppInsights.InternalWarningLogging)',
                    'APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING=$(AppInsights.InternalDebugLogging)'
                );
            }

            return variables;
        })
        .addCopyFiles("assets/appinsights_nextjs/serverConfig.ts", ({ options }) => options?.backend ? 'src/lib/appinsights/serverConfig.ts' : null)
        .addRenderTemplate("appinsights_nextjs", "appInsightsProvider.eta", ({ options }) => options?.frontend ? "src/lib/appinsights/index.tsx" : null)
        .addRenderTemplate("appinsights_nextjs", "instrumentation.eta", ({ options }) => options?.backend ? "src/instrumentation.ts" : null)
        .addFooter(() => {
            const link = terminalLink('Follow the steps to complete the installation', docsBaseUrl + 'addons/appinsights/nextjs/#finalize-installation');
            divider();
            error(link, "Attention", true)
        })
    )
    .addInstaller("dotnet", new AddonInstaller<DotnetAppinsightsOptions>()
        .addPrompt(async () => {
            divider();
            const frontend = await confirm({ message: `Do you want to add appinsights for ${chalk.magentaBright('frontend')}?` });
            const backend = await confirm({ message: `Do you want to add appinsights for ${chalk.magentaBright('backend')}?` });

            return {
                frontend,
                backend
            }
        })
        .addCopyFiles("assets/appinsights_dotnet/appInsightsProvider.tsx", (x) => x.options.frontend ? "src/lib/appinsights/appInsightsProvider.tsx" : null)
        .addInstallNpm((x) => {
            if(x.options.frontend) {
                return ['@microsoft/applicationinsights-react-js', '@microsoft/applicationinsights-clickanalytics-js']
            }
        })
        .addUpdateEnvVariables(".env.local", ( { options }) => {
            if(options.frontend) {
                return [
                    'VITE_APPLICATIONINSIGHTS_CONNECTION_STRING=',
                    'VITE_APPLICATIONINSIGHTS_DISABLE_COOKIES=false'
                ]
            }
        })
        .addInstallNuget((x) => {
            if(x.options.backend) {
                return ['Microsoft.ApplicationInsights.AspNetCore --version 2.22.0']
            }
        })
        .addUpdateJson(({dotnetCwd}) => `${path.join(dotnetCwd(), 'appsettings.json')}`, {
            ApplicationInsights: {
                ConnectionString: ""
            }
        })
        .addFooter(() => {
            const link = terminalLink('Follow the steps to complete the installation', docsBaseUrl + 'addons/appinsights/dotnet/#finalize-installation');
            divider();
            error(link, "Attention", true)
        })
    );