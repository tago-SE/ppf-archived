param location string

param resourceGroupName string

@allowed(['dev', 'test', 'prod'])
param env string

param tags object

param administrators array
param flexiServerName string 

param publicNetworkAccess bool

var deploymentPrefix = deployment().name

var abbr = loadJsonContent('../lib/abbreviations.json')

var vpnIpRestrictions = loadJsonContent('../lib/ipaddresses/vpn.json')


resource resourceGroup 'Microsoft.Resources/resourceGroups@2022-09-01' existing = {
  name: resourceGroupName
  scope: subscription()
}

var firewallRules = [
  for ip in filter(
    vpnIpRestrictions,
    ip => ip.rule == 'Allow' && (contains(ip.environment, env) || contains(ip.environment, '*'))
  ): {
    name: replace(ip.name, ' ', '_')
    startIpAddress: ip.startaddress
    endIpAddress: ip.endaddress
  }
]

module law_db '../modules/shared/loganalytics.bicep' = {
  name: '${deploymentPrefix}-${abbr.operationalInsightsWorkspaces}'
  scope: resourceGroup
  params: {
    name: '${flexiServerName}-${abbr.operationalInsightsWorkspaces}'
    location: resourceGroup.location
  }
}

// Not sure which are necesary to add 
var db_configurations = []
// Creates default databases
var databases = []

module flexibleServerModule './shared/db-postgres/main.bicep' = {
  name: '${deploymentPrefix}-${abbr.dBforPostgreSQLServers}'
  scope: resourceGroup
  params: {
    name: flexiServerName
    location: location
    skuName: 'Standard_B1ms'
    tags: tags
    tier: 'Burstable'
    publicNetworkAccess: publicNetworkAccess
    allowAllAzureServicesAndResourcesWithinAzureIps: true
    serverThreatProtection: true
    availabilityZone: env == 'prod' ? '2' : ''
    autoGrow: env == 'prod'
    firewallRules: firewallRules
    administrators: administrators
    configurations: db_configurations
    databases: databases
    workspaceResourceId: law_db.outputs.id
  }
}

// =============== //
//   Outputs       //
// =============== //

@description('The FQDN of the PostgreSQL Flexible server.')
output fqdn string = flexibleServerModule.outputs.fqdn

@description('Database port.')
output port string = '5432'

@description('Database name.')
output database string = 'postgres'

@description('The flexiserver name')
output flexiServerName string = flexibleServerModule.outputs.name
