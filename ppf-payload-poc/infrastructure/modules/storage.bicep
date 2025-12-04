param location string

@allowed(['dev', 'test', 'prod'])
param env string

param tags object

param storageName string

@description('Optional. Log Analytics Workspace name.')
param lawName string = ''

@description('EntraId group with access to created resources')
param developerGroupId string

@description('An array of strings containing the subnetIds e.g ["/subscriptions/{subscription}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}"]')
param subnetIds array = []

var deploymentPrefix = deployment().name
var abbr = loadJsonContent('../lib/abbreviations.json')

var vpnIpRestrictions = loadJsonContent('../lib/ipaddresses/vpn.json')

module law_storageAccount '../modules/shared/loganalytics.bicep' = if (lawName != '') {
  name: '${deploymentPrefix}-${abbr.operationalInsightsWorkspaces}'
  params: {
    name: lawName
    location: location
  }
}

var storage_IpRules = [
  for ip in filter(
    vpnIpRestrictions,
    ip => ip.rule == 'Allow' && (contains(ip.environment, env) || contains(ip.environment, '*'))
  ): {
    value: replace(ip.cidr, '/32', '')
    action: ip.rule
  }
]

var storage_virtualNetworkRules = [
  for subnetId in subnetIds: {
    id: subnetId
    action: 'Allow'
    state: 'Succeeded'
  }
]

module storageAccount './shared/storage-account/main.bicep' = {
  name: '${deploymentPrefix}-${abbr.storageStorageAccounts}'
  params: {
    location: location
    workspaceResourceId: lawName != '' ? law_storageAccount.outputs.id : ''
    blobServiceName: 'default'
    storageName: storageName
    kind: 'StorageV2'
    skuName: 'Standard_RAGRS'
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    ipRules: storage_IpRules
    virtualNetworkRules: storage_virtualNetworkRules
    blobContainerNames: env == 'dev' ? ['media', 'media-localdev'] : ['media']
    tags: tags
  }
}

// TODO THIS PART SHOULD BE MOVED TO THE APP

// var containerAppRoleAssigmentNames = [
//   'Reader'
//   'Storage Account Contributor'
//   'Storage Blob Data Contributor'
//   'Storage Blob Data Reader'
// ]

// module storageAccountApp_rbac './shared/storage-account/rbac.bicep' = if (length(appIdentityPrincipalId) > 0) {
//   name: '${deploymentPrefix}-stapp-rbac'
//   scope: resourceGroup
//   params: {
//     storageName: storageAccount.outputs.name
//     principalId: appIdentityPrincipalId
//     principalType: 'ServicePrincipal'
//     storageRoleAssigmentNames: containerAppRoleAssigmentNames
//   }
// }

var storageRoleAssigmentNames = [
  'Storage Account Contributor'
  'Storage Blob Data Contributor'
  'Storage Blob Data Reader'
]

module storageAccount_rbacGroup './shared/storage-account/rbac.bicep' = if (length(developerGroupId) > 0) {
  name: '${deploymentPrefix}-group-rbac'
  // scope: resourceGroup
  params: {
    storageName: storageAccount.outputs.name
    principalId: developerGroupId
    principalType: 'Group'
    storageRoleAssigmentNames: storageRoleAssigmentNames
  }
}

// =============== //
//   Outputs       //
// =============== //

output id string = storageAccount.outputs.id
output name string = storageAccount.outputs.name
output primaryBlobEndpoint string = storageAccount.outputs.primaryBlobEndpoint
output primaryMicrosoftBlobEndpoint string = storageAccount.outputs.primaryMicrosoftBlobEndpoint
