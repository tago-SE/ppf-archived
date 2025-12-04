param location string = resourceGroup().location
param tags object
@allowed(['dev', 'test', 'prod'])
param env string

param developerGroupId string
param appIdentityPrincipalId string

var developerGroupRoleAssignments = [
  for (roleDefinitionIdOrName, index) in [
    'Key Vault Administrator'
    'Key Vault Reader'
    'Key Vault Secrets User'
    'Key Vault Secrets Officer'
  ]: {
    roleDefinitionIdOrName: roleDefinitionIdOrName
    principalId: developerGroupId
    principalType: 'Group'
    description: 'Grant developerGroupId ${developerGroupId} ${roleDefinitionIdOrName}'
  }
]

var appIdentityRoleAssignments = [
  for (roleDefinitionIdOrName, index) in [
    'Key Vault Reader'
    'Key Vault Secrets User'
    'Key Vault Certificate User'
    'Key Vault Crypto Service Encryption User'
    'Key Vault Crypto User'
  ]: {
    roleDefinitionIdOrName: roleDefinitionIdOrName
    principalId: appIdentityPrincipalId
    principalType: 'ServicePrincipal'
    description: 'Grant appIdentityPrincipalId ${roleDefinitionIdOrName}'
  }
]

var pipelineRoleAssignments = [
  for (roleDefinitionIdOrName, index) in [
    'Key Vault Secrets Officer'
  ]: {
    roleDefinitionIdOrName: roleDefinitionIdOrName
    principalId: deployer().objectId
    principalType: 'ServicePrincipal'
    description: 'Grant deployer ${roleDefinitionIdOrName}'
  }
]

var keyVaultRoleAssignments = [
  ...developerGroupRoleAssignments
  ...appIdentityRoleAssignments
  ...pipelineRoleAssignments
]

// Public network access is disabled and request is not from a trusted service nor via an approved private link.
module keyVault './shared/kv/main.bicep' = {
  name: '${deployment().name}-${uniqueString(resourceGroup().id)}'
  scope: resourceGroup(subscription().subscriptionId, resourceGroup().name)
  params: {
    name: 'kv-${env}-${uniqueString(resourceGroup().id)}'
    tags: tags
    location: location
    sku: 'standard'
    // TODO: Need to change this so that that the container App + VPN has access ?
    publicNetworkAccess: 'Enabled'
    roleAssignments: keyVaultRoleAssignments
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
      /*
        Note: This was removed because if added it teams cannot use the keyvault for local development, or it would be more difficult to configure. Any suggestions? 
      */
      // ipRules:[{
      //   value: containerEnvironment.properties.staticIp
      // }]
    }
  }
}

// =========== //
// Outputs     //
// =========== //

@description('The resource ID of the key vault.')
output resourceId string = keyVault.outputs.resourceId

@description('The name of the resource group the key vault was created in.')
output resourceGroupName string = keyVault.outputs.resourceGroupName

@description('The name of the key vault.')
output name string = keyVault.outputs.name

@description('The URI of the key vault.')
output uri string = keyVault.outputs.uri
