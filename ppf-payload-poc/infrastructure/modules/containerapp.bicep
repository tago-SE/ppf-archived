// https://github.com/Azure/bicep-registry-modules/blob/main/avm/res/app/container-app/main.bicep
param location string = resourceGroup().location
param tags object
@allowed(['dev', 'test', 'prod'])
param env string

// Common
param commonResourceGroupName string
param registryName string
param storageName string
param containerEnvironmentName string
param logWorkspaceName string
param registryIdentityName string
param dbIdentityName string

param serviceMsGraphIdentityResourceId string = ''

// NATGW
param natGatewayPublicIPAddressName string
@description('PublicIpAddress e.g. 20.107.79.90')
param natGatewayPublicIPAddress string

param developerGroupId string

// App
param name string
param appIdentityName string
param appInsightsName string
param customHostname string
param certificateId string

@description('Required. Container image tag.')
param image string
param targetPort int = 3000
@secure()
param secretsJson string = ''
param envVariablesJson string = ''

var customHostNameObject = empty(certificateId)
  ? {
      name: customHostname
      bindingType: 'Disabled'
    }
  : {
      name: customHostname
      bindingType: 'SniEnabled'
      certificateId: certificateId
    }

resource commonRG 'Microsoft.Resources/resourceGroups@2022-09-01' existing = {
  name: commonResourceGroupName
  scope: subscription()
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: registryName
  scope: commonRG
}

resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerEnvironmentName
  scope: commonRG
}

resource dbIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: dbIdentityName
  scope: commonRG
}

resource registryIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: registryIdentityName
  scope: commonRG
}

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' existing = {
  name: logWorkspaceName
  scope: commonRG
}

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: appIdentityName
  location: location
  tags: tags
}

var containerAppRoleAssigmentNames = [
  'Reader'
  'Storage Account Contributor'
  'Storage Blob Data Contributor'
  'Storage Blob Data Reader'
]

resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' existing = {
  scope: commonRG
  name: storageName
}

module storageAccountApp_rbac './shared/storage-account/rbac.bicep' = {
  name: '${deployment().name}-st-ca-rbac'
  scope: commonRG
  params: {
    storageName: storageName
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    storageRoleAssigmentNames: containerAppRoleAssigmentNames
  }
}

// TODO: Need to test RBAC for Appi
/*
Go to the "Access control (IAM)" section and assign the "Monitoring Metrics Publisher" role to the user-assigned managed identity.Configure Your Application to Use Managed

TelemetryConfiguration.Active.ConnectionString = "InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://xxxx.applicationinsights.azure.com/";
var credential = new DefaultAzureCredential();
TelemetryConfiguration.Active.SetAzureTokenCredential(credential);
*/
// resource insights 'Microsoft.Insights/components@2020-02-02' = {
//   name: appInsightsName
//   kind: 'web'
//   location: location
//   properties: {
//     Application_Type: 'web'
//     WorkspaceResourceId: law.id
//   }
// }

module insights './shared/insights/main.bicep' = {
  params: {
    name: appInsightsName
    workspaceResourceId: law.id
    applicationType: 'web'
    kind: 'web'
    tags: tags
    roleAssignments: [
      {
        principalId: appIdentity.properties.principalId
        roleDefinitionIdOrName: 'Monitoring Metrics Publisher'
        principalType: 'ServicePrincipal'
      }
    ]
  }
}

// TODO: private endpoint + VPN ..?
module kv './containerappKeyvault.bicep' = {
  name: '${deployment().name}-kv'
  scope: resourceGroup(subscription().subscriptionId, resourceGroup().name)
  params: {
    tags: tags
    env: env
    developerGroupId: developerGroupId
    appIdentityPrincipalId: appIdentity.properties.principalId
  }
}

var defaultVariables = [
  {
    name: 'FQDN'
    value: 'https://${customHostname}'
  }
  {
    name: 'INTERNAL_URI'
    value: 'http://${name}'
  }
  {
    name: 'APP_MANAGED_IDENTITY_CLIENTID'
    value: appIdentity.properties.clientId
  }
  {
    name: 'APP_MANAGED__IDENTITY__OBJECTID'
    value: appIdentity.properties.principalId
  }
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
    secretRef: 'appi-secret'
  }
  {
    name: 'AZURE_STORAGE_ACCOUNT_BASEURL'
    value: storageAccount.properties.primaryEndpoints.microsoftEndpoints.blob
  }
  // {
  //   name: 'APPLICATIONINSIGHTS_AUTHENTICATION_STRING'
  //   value: ''
  // }
  {
    name: 'KEYVAULT_URI'
    value: kv.outputs.uri
  }
]
var envVariables = empty(envVariablesJson) ? defaultVariables : json(envVariablesJson)

var defaultSecrets = [
  {
    name: 'appi-secret' // Alternativly, move to KV?
    value: insights.outputs.connectionString
  }
]

var secrets = empty(secretsJson) ? defaultSecrets : json(secretsJson)

var vpnIpRestrictions = loadJsonContent('../lib/ipaddresses/vpn.json')
var ipRestrictions = concat(
  [
    {
      name: 'API Platform Prod Gateway'
      startaddress: '20.73.203.152'
      endaddress: '20.73.203.152'
      cidr: '20.73.203.152/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        'prod'
      ]
    }
    {
      name: 'API Platform Stage Gateway'
      startaddress: '20.82.33.134'
      endaddress: '20.82.33.134'
      cidr: '20.82.33.134/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        'dev'
        'test'
      ]
    }
    {
      name: 'DevOps Deployment Server APIs'
      startaddress: '20.16.129.227'
      endaddress: '20.16.129.227'
      cidr: '20.16.129.227/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        '*'
      ]
    }
    {
      name: 'Curity Dev'
      startaddress: '20.67.213.186'
      endaddress: '20.67.213.186'
      cidr: '20.67.213.186/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        'dev'
        'test'
      ]
    }
    {
      name: 'Curity Test'
      startaddress: '20.67.128.174'
      endaddress: '20.67.128.174'
      cidr: '20.67.128.174/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        'dev'
        'test'
      ]
    }
    {
      name: 'Curity Production'
      startaddress: '20.93.97.248'
      endaddress: '20.93.97.248'
      cidr: '20.93.97.248/32'
      rule: 'Allow'
      priority: 1000
      environment: [
        'prod'
      ]
    }
    // Currently the demo apps are insie the PPF infra
    {
      name: 'PPF NAT Gateway Dev (Outbound IP)'
      startaddress: '52.166.147.78'
      endaddress: '52.166.147.78'
      cidr: '52.166.147.78/32'
      rule: 'Allow'
      priority: 1000
      environment: ['dev', 'test']
    }
    {
      name: 'PPF NAT Gateway Test (Outbound IP)'
      startaddress: '13.95.121.139'
      endaddress: '13.95.121.139'
      cidr: '13.95.121.139/32'
      rule: 'Allow'
      priority: 1000
      environment: ['dev', 'test']
    }
    {
      name: 'PPF NAT Gateway Prod (Outbound IP)'
      startaddress: '20.23.15.134'
      endaddress: '20.23.15.134'
      cidr: '20.23.15.134/32'
      rule: 'Allow'
      priority: 1000
      environment: ['prod']
    }
    // 
    {
      name: natGatewayPublicIPAddressName
      startaddress: natGatewayPublicIPAddress
      endaddress: natGatewayPublicIPAddress
      cidr: '${natGatewayPublicIPAddress}/32'
      rule: 'Allow'
      priority: 1100
      environment: [env]
    }
  ],
  vpnIpRestrictions
)

var ipRules = [
  for rule in filter(
    ipRestrictions,
    ip => ip.rule == 'Allow' && (contains(ip.environment, env) || contains(ip.environment, '*'))
  ): {
    name: rule.name
    ipAddressRange: rule.cidr
    action: rule.rule
  }
]

var msGraphIdentityBlock = empty(serviceMsGraphIdentityResourceId)
  ? {}
  : {
      '${serviceMsGraphIdentityResourceId}': {}
    }

var userAssignedIdentities = union(
  {
    '${registryIdentity.id}': {}
    '${appIdentity.id}': {}
    '${dbIdentity.id}': {}
  },
  msGraphIdentityBlock
)

resource app 'Microsoft.App/containerApps@2023-05-01' = {
  location: location
  name: name
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: userAssignedIdentities
  }
  properties: {
    environmentId: containerEnvironment.id
    configuration: {
      ingress: {
        ipSecurityRestrictions: ipRules
        targetPort: targetPort
        external: true
        corsPolicy: {
          allowedOrigins: [
            'https://${customHostname}'
          ]
        }
        customDomains: [
          customHostNameObject
        ]
      }
      registries: [
        {
          identity: registryIdentity.id
          server: registry.properties.loginServer
        }
      ]
      secrets: secrets
    }
    template: {
      containers: [
        {
          image: image
          name: name
          env: envVariables
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: null
      }
    }
  }
}

// =============== //
//   Outputs       //
// =============== //

output fqdn string = app.properties.configuration.ingress.fqdn
output customHostname string = customHostname
output internalUri string = 'http://${app.name}'
output appIdentityName string = appIdentity.name
output appKeyVaultName string = kv.outputs.name
