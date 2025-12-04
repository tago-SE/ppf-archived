# Env Variables

<!-- https://www.saltycrane.com/blog/2021/04/buildtime-vs-runtime-environment-variables-nextjs-docker/

https://create.t3.gg/en/usage/env-variables

## Docker

### Notes:

docker build -t nextjs-launchpad -f ./apps/nextjs/Dockerfile .\apps\nextjs\ --build-arg KEY_VAULT_URL='https://kv-dev-xsgmk7lcgpv4q.vault.azure.net/'

docker run -p 3000:3000 nextjs-launchpad


Vercel
https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

Docker build once deploy everywhere
https://dev.to/michaliskout/runtime-environmental-variables-in-nextjs-14-4pof

Docker-Compose nextjs
https://therahulsarkar.medium.com/containerize-your-next-js-14-application-with-docker-a-step-by-step-guide-93a6133fe073

================

NEXT_PUBLIC_ environment variables are replaced at build-time, but docker build does not read environment variables when building. You must use "build arguments" to pass values into the build process.

Here's an example:

FROM node:20-alpine
# ... everything else
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build
or with a default value:

ARG NEXT_PUBLIC_APP_URL=https://defaultvalue.example.com
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
Then you provide the build arguments when building your image, like this:

docker build --build-arg NEXT_PUBLIC_APP_URL=https://example.com


## Solution for Run-Time Client variables

https://github.com/vercel/next.js/discussions/44628#discussioncomment-6918154

1. PUBLIC_MY_VARIABLE
2. Create context provider


[next-runtime-env] -->

## PPF Container App Pipeline

### Secrets

To manage secrets in your pipeline, you can either retrieve them from an Azure Key Vault or define them directly as seen in the example below. You can read more about how to [manage container app secrets].

??? note "Updating Container App Secrets"

    $jsonBody = @"
    {
        "properties": {
            "configuration": {
                "registries": [
                    {
                        "identity": "/subscriptions/$(Infrastructure.SubscriptionId)/resourceGroups/$(Infrastructure.ResourceGroupName)/providers/Microsoft.ManagedIdentity/userAssignedIdentities/$(Infrastructure.ContainerRegistryIdentityName)",
                        "server": "$(containerRegistryName).azurecr.io",
                        "passwordSecretRef": "",
                        "username": ""
                    }
                ],
                "secrets": [
                    {
                        "name": "piplinesecret",
                        "identity": "/subscriptions/$(Infrastructure.SubscriptionId)/resourcegroups/$(Infrastructure.ResourceGroupName)/providers/Microsoft.ManagedIdentity/userAssignedIdentities/$(Infrastructure.ContainerIdentityName)",
                        "keyVaultUrl": "$(KeyVault.Url)secrets/piplinesecret"
                    },
                    {
                        "name": "appi-secret",
                        "value": "$appiConnectionString"
                    }
                ]
            },
            "template": {
                "containers": [
                    {
                        "image": "$(containerRegistryName).azurecr.io/$(imageName):$(build.buildid)",
                        "name": "$(Infrastructure.ContainerAppName)"
                    }
                ]
            }
        }
    }
    "@
    Write-Host "Setting secrets"
    az rest --method patch `
    --url "/subscriptions/$(Infrastructure.SubscriptionId)/resourceGroups/$(Infrastructure.ResourceGroupName)/providers/Microsoft.App/containerApps/$(Infrastructure.ContainerAppName)?api-version=$(Infrastructure.AzureCliApiVersion)" `
    --headers Content-Type=application/json `
    --body $jsonBody

??? note "Referencing secrets in Environment Variables"

    Write-Host "Adding env variables"
    az containerapp update `
    --name $(Infrastructure.ContainerAppName) `
    --resource-group $(Infrastructure.ResourceGroupName) `
    --set-env-vars `
    PIPELINE_SECRET=secretref:piplinesecret `
    NOT_A_SECRET=$(SomeValue)

Important:
!!! abstract "Checklist"

1) Avoid using secret names that are longer than 20 characters.
2) Secrets should ideally always be stored in a KeyVault and injected using secretref or loaded in the application at run-time. If they are written directly as env-vars without using secret-ref everyone who has access to the Container App resource in the Azure Portal will possibly be able to see the value.

### Variables

Main thing to note is that environment variables need to be updated in the pipeline after the secrets have been set, this is the reason for why it is done in two steps in the previous examples.

For .NET applications, name your environment variables with double spacing so they map correctly to your `appsettings.json`. For example, `My__App__Setting` will be mapped to `My.App.Setting`.

[next-runtime-env]: https://www.npmjs.com/package/next-runtime-env

[manage container app secrets]: https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets?tabs=azure-cli#defining-secrets