import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import path from "path";
import { AddonBase, AddonInstaller } from "~/lib/addons";
import { ProgramCsSection } from "~/utils";
import { divider } from "~/log";
import { error } from "console";
import terminalLink from "terminal-link";
import { docsBaseUrl } from "~/consts";

type NextJsKeyvaultOptions = {
    secretClient?: boolean
    certClient?: boolean
    keyClient?: boolean
}

type DotnetKeyvaultOptions = {}

const nextjs = new AddonInstaller<NextJsKeyvaultOptions>()
    .addPrompt(async () => {
        divider();
        const secretClient = await confirm({ message: `Do you want to add ${chalk.magentaBright('SecretClient')}?` });
        const certClient = await confirm({ message: `Do you want to add ${chalk.magentaBright('CertificateClient')}?` });
        const keyClient = await confirm({ message: `Do you want to add ${chalk.magentaBright('KeyClient')}?` });

        return {
            secretClient,
            certClient,
            keyClient
        }
    })
    .addInstallNpm(({ options }) => {
        const packages = ['@azure/identity'];
        if(options?.secretClient) { packages.push('@azure/keyvault-secrets') }
        if(options?.certClient) { packages.push('@azure/keyvault-certificates') }
        if(options?.keyClient) { packages.push('@azure/keyvault-keys') }

        return packages;
    })
    .addRenderTemplate("", "nextjs_keyvault_lib.eta", "src/lib/keyvault/index.ts", (x) => x.options)
    .addCopyFiles("assets/keyvault_nextjs", "src/app/api/keyvault")
    .addUpdateEnvMjs("src/env.mjs", {
        processEnv: [
            'KEY_VAULT_URL: getEnv("KEY_VAULT_URL")',
            'KEY_VAULT_CLIENTID: getEnv("KEY_VAULT_CLIENTID")'
        ],
        server: [
            'KEY_VAULT_URL: z.string().min(1).url("Must be a valid URL")',
            'KEY_VAULT_CLIENTID: z.string().optional()'
        ]
    })
    .addUpdateEnvVariables(".env.example",[
        'KEY_VAULT_URL=https://{YOUR_KEYVAULT}.vault.azure.net/',
        'KEY_VAULT_CLIENTID='
    ])
    .addUpdateYaml("portal-pipeline.yml", [
        'KEY_VAULT_URL=$(KeyVault.Url)',
        'KEY_VAULT_CLIENTID=$principalId'
    ])
    .addFooter(() => {
        const link = terminalLink('Follow the steps to complete the installation', docsBaseUrl + 'addons/keyvault/nextjs/#finalize-installation');
        divider();
        error(link, "Attention", true)
    });

const dotnet = new AddonInstaller<DotnetKeyvaultOptions>()
    .addRenderTemplate("keyvault_dotnet", "KeyVaultOptions.eta", async ({ dotnetLibTarget }) => path.join(dotnetLibTarget("KeyVault"), "KeyVaultOptions.cs"), ({ dotnetName, dotnetNs }) => ({ projectName: dotnetName(), namespace: dotnetNs("KeyVault") }))
    .addRenderTemplate("keyvault_dotnet", "KeyVaultConfigurationExtensions.eta", async ({ dotnetLibTarget }) => path.join(dotnetLibTarget("KeyVault"), "KeyVaultConfigurationExtensions.cs"), ({ dotnetName, dotnetNs }) => ({ projectName: dotnetName(), namespace: dotnetNs("KeyVault") }))
    .addUpdateProgramCs(({ dotnetCwd }) => path.join(dotnetCwd(), "Program.cs"), ({ dotnetNs }) => [
        {
            section: ProgramCsSection.using,
            value: `using ${dotnetNs("KeyVault")};`
        },
        {
            section: ProgramCsSection.builder,
            value: `builder.ConfigureKeyVault();`
        }
    ])
    .addUpdateJson(({ dotnetCwd }) => path.join(dotnetCwd(), 'appsettings.json'), {
        KeyVault: {
            Url: '',
            ClientId: '',
            ObjectId: ''
        }
    })
    .addInstallNuget([
        'Azure.Extensions.AspNetCore.Configuration.Secrets --version 1.3.2'
    ])
    .addFooter(() => {
        const link = terminalLink('Follow the steps to complete the installation', docsBaseUrl + 'addons/keyvault/dotnet/#finalize-installation');
        divider();
        error(link, "Attention", true)
    });

export default new AddonBase('keyvault').addInstaller("nextjs", nextjs).addInstaller("dotnet", dotnet);