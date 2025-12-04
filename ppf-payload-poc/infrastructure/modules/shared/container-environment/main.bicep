// https://github.com/Azure/bicep-registry-modules/blob/main/avm/res/app/managed-environment/main.bicep

@description('Required. Name of the Container Apps Managed Environment.')
param name string

@description('Optional. Location for all resources.')
param location string = resourceGroup().location

@description('Optional. Tags of the resource.')
param tags object?

@description('Optional. Tier of your Azure container registry.')
@allowed([
  'Consumption'
])
param sku string = 'Consumption'

param lawName string

param vnetName string
param subnetName string

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' existing = {
  name: lawName
}

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' existing = {
  name: vnetName
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' existing = {
  name: subnetName
  parent: vnet
}

resource containerEnvironment 'Microsoft.App/managedEnvironments@2024-10-02-preview' = {
  name: name
  location: location
  tags: tags
  properties: {
    workloadProfiles: [
      {
        workloadProfileType: sku
        name: sku
      }
    ]
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: subnet.id
      internal: false
    }
    zoneRedundant: false
  }
}

// =============== //
//   Outputs       //
// =============== //

output name string = containerEnvironment.name
output customDomainVerificationId string = containerEnvironment.properties.customDomainConfiguration.customDomainVerificationId
output defaultDomain string = containerEnvironment.properties.defaultDomain
