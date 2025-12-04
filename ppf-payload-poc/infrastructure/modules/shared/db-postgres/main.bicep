metadata name = 'DBforPostgreSQL Flexible Servers'
metadata description = 'This module deploys a DBforPostgreSQL Flexible Server.'

@description('Required. The name of the PostgreSQL flexible server.')
param name string

@description('Optional. Location for all resources.')
param location string = resourceGroup().location

@description('Optional. Tags of the resource.')
param tags object?

@description('Required. The name of the sku, typically, tier + family + cores, e.g. Standard_D4s_v3.')
param skuName string

@allowed([
  'GeneralPurpose'
  'Burstable'
  'MemoryOptimized'
])
@description('Required. The tier of the particular SKU. Tier must align with the \'skuName\' property. Example, tier cannot be \'Burstable\' if skuName is \'Standard_D4s_v3\'.')
param tier string

@description('Optional. Determines whether or not public network access is enabled or not.')
param publicNetworkAccess bool = false

@allowed([
  '11'
  '12'
  '13'
  '14'
  '15'
  '16'
  '17'
])
@description('Optional. PostgreSQL Server version.')
param version string = '17'

@allowed([
  ''
  '1'
  '2'
  '3'
])
@description('Optional. Availability zone information of the server. Default will have no preference set.')
param availabilityZone string = ''

@description('Flag to enable / disable Storage Auto grow for flexible server.')
param autoGrow bool

@description('Optional. The administrator login name of the server. Can only be specified when the PostgreSQL server is being created.')
param administratorLogin string?

@description('Optional. The administrator login password.')
@secure()
param administratorLoginPassword string?

@description('Optional. The Azure AD administrators when AAD authentication enabled.')
param administrators array = []

@description('Optional. The firewall rules to create in the PostgreSQL flexible server.')
param firewallRules array = []

@description('Optional. The configurations to create in the server.')
param configurations array = []

@description('When set to true it will add firewall "AllowAllAzureServicesAndResourcesWithinAzureIps" with IP Range 0.0.0.0 - 0.0.0.0')
param allowAllAzureServicesAndResourcesWithinAzureIps bool = true

@description('Optional. Enable/Disable advanced threat protection.')
param serverThreatProtection bool = true

@description('Optional. The databases to create in the server.')
param databases array = []

@description('Optional. Log Analaytics Workspace.')
param workspaceResourceId string = ''

resource flexibleServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: tier
  }
  properties: {
    replica: {
      role: 'Primary'
    }
    storage: {
      iops: 120
      tier: 'P4'
      storageSizeGB: 32
      autoGrow: autoGrow ? 'Enabled' : 'Disabled'
    }
    network: {
      publicNetworkAccess: publicNetworkAccess ? 'Enabled' : 'Disabled'
    }
    dataEncryption: {
      type: 'SystemManaged'
    }
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    authConfig: {
      passwordAuth: !empty(administratorLogin) && !empty(administratorLoginPassword) ? 'Enabled' : 'Disabled'
      activeDirectoryAuth: !empty(administrators) ? 'Enabled' : 'Disabled'
      tenantId: tenant().tenantId
    }
    version: version
    availabilityZone: availabilityZone
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
      dayOfWeek: 0
      startHour: 0
      startMinute: 0
    }
    replicationRole: 'Primary'
  }
}

module flexibleServer_databases './database.bicep' = [
  for (database, index) in databases: {
    name: '${uniqueString(deployment().name, location)}-PostgreSQL-DB-${index}'
    params: {
      name: database.name
      flexibleServerName: flexibleServer.name
      collation: database.?collation
      charset: database.?charset
    }
  }
]

var firewallRule_AllowAzureServiceAndResourcesWithinAzureIpds = {
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  startIpAddress: '0.0.0.0'
  endIpAddress: '0.0.0.0'
}

var updatedFirewallRules = allowAllAzureServicesAndResourcesWithinAzureIps
  ? union(firewallRules, [firewallRule_AllowAzureServiceAndResourcesWithinAzureIpds])
  : firewallRules

@batchSize(1)
module flexibleServer_firewallRules './firewall-rule.bicep' = [
  for (firewallRule, index) in updatedFirewallRules: {
    name: '${uniqueString(deployment().name, location)}-PostgreSQL-FirewallRules-${index}'
    params: {
      name: firewallRule.name
      flexibleServerName: flexibleServer.name
      startIpAddress: firewallRule.startIpAddress
      endIpAddress: firewallRule.endIpAddress
    }
    dependsOn: [flexibleServer_databases]
  }
]

@batchSize(1)
module flexibleServer_configurations './configuration.bicep' = [
  for (configuration, index) in configurations: {
    name: '${uniqueString(deployment().name, location)}-PostgreSQL-Configurations-${index}'
    params: {
      name: configuration.name
      flexibleServerName: flexibleServer.name
      source: configuration.?source
      value: configuration.?value
    }
    dependsOn: [
      flexibleServer_firewallRules
    ]
  }
]

module flexibleServer_administrators './administrator.bicep' = [
  for (administrator, index) in administrators: {
    name: '${uniqueString(deployment().name, location)}-PostgreSQL-Administrators-${index}'
    params: {
      flexibleServerName: flexibleServer.name
      objectId: administrator.objectId
      principalName: administrator.principalName
      principalType: administrator.principalType
      tenantId: administrator.tenantId
    }
    dependsOn: [flexibleServer_configurations]
  }
]

module flexibleServer_advancedThreatProtection './advanced-threat-protection.bicep' = if (serverThreatProtection) {
  name: '${uniqueString(deployment().name, location)}-PostgreSQL-Threat'
  params: {
    state: serverThreatProtection ? 'Enabled' : 'Disabled'
    flexibleServerName: flexibleServer.name
  }
  dependsOn: [
    flexibleServer_administrators
  ]
}

resource flexibleServer_diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (workspaceResourceId != '') {
  name: '${flexibleServer.name}-diagnosticSettings'
  scope: flexibleServer
  properties: {
    workspaceId: workspaceResourceId
    logs: [
      {
        categoryGroup: 'allLogs'
        category: null
        enabled: true
      }
      {
        categoryGroup: 'audit'
        category: null
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        timeGrain: null
        enabled: true
      }
    ]
  }
}

// =============== //
//   Outputs       //
// =============== //

@description('The name of the deployed PostgreSQL Flexible server.')
output name string = flexibleServer.name

@description('The resource ID of the deployed PostgreSQL Flexible server.')
output resourceId string = flexibleServer.id

@description('The resource group of the deployed PostgreSQL Flexible server.')
output resourceGroupName string = resourceGroup().name

@description('The location the resource was deployed into.')
output location string = flexibleServer.location

@description('The FQDN of the PostgreSQL Flexible server.')
output fqdn string = flexibleServer.properties.fullyQualifiedDomainName
