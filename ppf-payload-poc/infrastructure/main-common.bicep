targetScope = 'subscription'

@allowed(['dev', 'test', 'prod'])
param env string
@allowed(['westeurope'])
param location string = 'westeurope'
param namePrefix string
param systemCode string = 'AISPPAT'
param emailResponsible string = 'FMITLego@if.no'

@description('Entra Group ObjectId for admin access to DB')
param dbAdminGroupId string

@description('The Admin PrincipalName for the EntraGroup for DB access')
param dbAdminGroupPrincipalName string

@description('Address Prefix (CIDR notation, /23 or greater, default 10.0.0.0/16 = 10.0.0.1 - 10.0.255.254)')
param vnetAddressPrefix string = '10.0.0.0/16' // 10.0.0.1 - 10.0.255.254

@description('Subnet Address Prefix (CIDR notation, /24 or greater, default 10.0.0.0/18)')
param containerSubnetAddressPrefix string = '10.0.0.0/18' // 10.0.0.1 - 10.0.63.254

@description('Subnet Address Prefix (CIDR notation, /24 or greater, default 10.0.64.0/18)')
param serviceSubnetAddressPrefix string = '10.0.64.0/18' //10.0.64.1 - 10.0.127.254

@description('Entra Group for broad developer access')
param developerGroupId string
@description('Optional. Overrides the default generated storage name.')
param storageName string = ''

var abbr = loadJsonContent('./lib/abbreviations.json')

var baseNameWithEnv = '${namePrefix}-${env}'
var deploymentPrefix = '${deployment().name}-${env}'

var commonResourceGroupName = '${namePrefix}-common-${env}-rg'

var registryIdentityName = '${baseNameWithEnv}-${abbr.containerRegistryRegistries}-${abbr.managedIdentityUserAssignedIdentities}'
var registryName = replace('${baseNameWithEnv}-${abbr.containerRegistryRegistries}', '-', '')

var _storageName = storageName != ''
  ? storageName
  : replace('${baseNameWithEnv}-${abbr.storageStorageAccounts}', '-', '')

var containerEnvironmentName = '${baseNameWithEnv}-${abbr.appManagedEnvironments}'

var lawName_containerEnvironment = '${baseNameWithEnv}-${abbr.appManagedEnvironments}-${abbr.operationalInsightsWorkspaces}'
var lawName_storage = '${baseNameWithEnv}-${abbr.storageStorageAccounts}-${abbr.operationalInsightsWorkspaces}'
var lawName_containerApps = '${baseNameWithEnv}-${abbr.appContainerApps}-${abbr.operationalInsightsWorkspaces}'

var containerSubnetName = '${baseNameWithEnv}-cae-subnet'
var serviceSubnetName = '${baseNameWithEnv}-service-subnet'
var vnetName = '${baseNameWithEnv}-${abbr.networkVirtualNetworks}'

var tags = {
  ITSystemCode: systemCode
  Responsible: emailResponsible
  Environment: env
}

resource commonRG 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: commonResourceGroupName
  location: location
  tags: tags
}

module registry './modules/registry.bicep' = {
  name: '${deploymentPrefix}-${abbr.containerRegistryRegistries}'
  scope: commonRG
  params: {
    tags: tags
    location: location
    registryIdentityName: registryIdentityName
    registryName: registryName
  }
}

module law_cae './modules/shared/loganalytics.bicep' = {
  name: '${deploymentPrefix}-${abbr.appManagedEnvironments}-${abbr.operationalInsightsWorkspaces}'
  scope: resourceGroup(commonRG.name)
  params: {
    name: lawName_containerEnvironment
    location: commonRG.location
  }
}

// Move this to the container app - is this necessary - i have quite many LAWs...

module law_ca './modules/shared/loganalytics.bicep' = {
  name: '${deploymentPrefix}-${abbr.appContainerApps}-${abbr.operationalInsightsWorkspaces}'
  scope: resourceGroup(commonRG.name)
  params: {
    name: lawName_containerApps
    location: commonRG.location
  }
}

// TODO: The subnet 'serviceSubnetName' is not actually being used in the currrent setup - CHECK WITH HENRIK 
module vnet './modules/vnet.bicep' = {
  name: '${deploymentPrefix}-${abbr.networkVirtualNetworks}'
  scope: resourceGroup(commonRG.name)
  params: {
    vnetName: vnetName
    location: location
    baseNameWithEnv: baseNameWithEnv
    abbreviations: abbr
    addressSpace: [vnetAddressPrefix]
    containerSubnetName: containerSubnetName
    containerSubnetAddressPrefix: containerSubnetAddressPrefix
    serviceSubnetName: serviceSubnetName
    serviceSubnetAddressPrefix: serviceSubnetAddressPrefix
    tags: tags
  }
}

module containerEnvironment './modules/shared/container-environment/main.bicep' = {
  name: '${deployment().name}-${abbr.appManagedEnvironments}'
  scope: resourceGroup(commonRG.name)
  params: {
    name: containerEnvironmentName
    location: commonRG.location
    lawName: law_cae.outputs.name
    vnetName: vnet.outputs.vnetName
    subnetName: containerSubnetName
  }
}

// =============== //
//   Services      //   
// =============== //

// ~ StorageAccount ~

var containerSubnet = first(filter(vnet.outputs.subnets, (s) => s.name == containerSubnetName))

module storage './modules/storage.bicep' = {
  name: '${deploymentPrefix}-${abbr.storageStorageAccounts}'
  scope: commonRG
  params: {
    lawName: lawName_storage
    env: env
    storageName: _storageName
    subnetIds: [containerSubnet.id]
    developerGroupId: developerGroupId
    tags: tags
    location: location
  }
}

// ~ PostgreSQL ~

var flexiServerName = '${baseNameWithEnv}-${abbr.dBforPostgreSQLServers}'

module pgsql_id 'modules/user-identity.bicep' = {
  name: '${deploymentPrefix}-${abbr.dBforPostgreSQLServers}-id'
  scope: commonRG
  params: {
    location: location
    name: '${flexiServerName}-${abbr.managedIdentityUserAssignedIdentities}'
    tags: tags
  }
}

var db_admins = {
  // Database maintainers
  maintainers: {
    objectId: dbAdminGroupId
    principalType: 'Group'
    principalName: dbAdminGroupPrincipalName
    tenantId: tenant().tenantId
  }
  // Shared UserAssigned ManagedIdentity
  sharedIdentity: {
    objectId: pgsql_id.outputs.principalId
    principalType: 'ServicePrincipal'
    principalName: pgsql_id.outputs.name
    tenantId: pgsql_id.outputs.tenantId
  }
}

module pgsql './modules/postgres.bicep' = {
  name: '${deploymentPrefix}-${abbr.dBforPostgreSQLServers}'
  scope: commonRG
  params: {
    env: env
    flexiServerName: flexiServerName
    administrators: [
      db_admins.maintainers
      db_admins.sharedIdentity
    ]
    // TODO: Check if this is OK... There are some firewall rules at least...
    publicNetworkAccess: true
    resourceGroupName: commonResourceGroupName
    location: location
    tags: tags
  }
}

// =============== //
//   Outputs       //
// =============== //

var pgsql_uri = '${pgsql.outputs.fqdn}:${pgsql.outputs.port}/${pgsql.outputs.database}'

output pgsql object = {
  host: pgsql.outputs.fqdn
  port: pgsql.outputs.port
  database: pgsql.outputs.database
  serverName: pgsql.outputs.flexiServerName
  uri: pgsql_uri
  connectionStrings: {
    maintainers: 'postgres://${db_admins.maintainers.principalName}:@${pgsql_uri}'
    sharedIdentity: 'postgres://${db_admins.sharedIdentity.principalName}:@${pgsql_uri}'
  }
}

output storageAccount object = {
  name: storage.outputs.name
  primaryBlobEndpoint: storage.outputs.primaryBlobEndpoint
  primaryMicrosoftBlobEndpoint: storage.outputs.primaryMicrosoftBlobEndpoint
}

output cae object = {
  name: containerEnvironmentName
  customDomainVerificationId: containerEnvironment.outputs.customDomainVerificationId
  defaultDomain: containerEnvironment.outputs.defaultDomain
}

output registry object = {
  name: registryName
  sharedIdentity: registryIdentityName
}

output vnetName string = vnet.outputs.vnetName
output subnets array = [toObject(vnet.outputs.subnets, subnet => subnet.name, subnet => subnet.id)]
output natGatewayIp object = vnet.outputs.natGatewayIp
output commonResourceGroupName string = commonResourceGroupName

output dbIdentityName string = pgsql_id.outputs.name
output registryIdentityName string = registry.outputs.registryIdentityName
output registryName string = registry.outputs.registryName
output storageName string = storage.outputs.name
// output containerEnvironmentName
// natGatewayPublicIPAddressName
// logWorkspaceName
