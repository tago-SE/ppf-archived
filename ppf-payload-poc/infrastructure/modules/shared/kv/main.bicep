// https://github.com/Azure/bicep-registry-modules/blob/main/avm/res/key-vault/vault/main.bicep

metadata name = 'Key Vaults'
metadata description = 'This module deploys a Key Vault.'

// ================ //
// Parameters       //
// ================ //
@description('Required. Name of the Key Vault. Must be globally unique.')
@maxLength(24)
param name string

@description('Optional. Location for all resources.')
param location string = resourceGroup().location

@description('Optional. All access policies to create.')
param accessPolicies accessPolicyType[]?

// @description('Optional. All secrets to create.')
// param secrets secretType[]?

// @description('Optional. All keys to create.')
// param keys keyType[]?

@description('Optional. The vault\'s create mode to indicate whether the vault need to be recovered or not. - recover or default.')
param createMode string = 'default'

@description('Optional. Specifies the SKU for the vault.')
@allowed([
  'premium'
  'standard'
])
param sku string = 'standard'

@description('Optional. Rules governing the accessibility of the resource from specific network locations.')
param networkAcls object?

@description('Optional. Whether or not public network access is allowed for this resource. For security reasons it should be disabled. If not specified, it will be disabled by default if private endpoints are set and networkAcls are not set.')
@allowed([
  ''
  'Enabled'
  'Disabled'
])
param publicNetworkAccess string = ''

// import { lockType } from 'br/public:avm/utl/types/avm-common-types:0.5.1'
// @description('Optional. The lock settings of the service.')
// param lock lockType?

import { roleAssignmentType } from 'br/public:avm/utl/types/avm-common-types:0.5.1'
@description('Optional. Array of role assignments to create.')
param roleAssignments roleAssignmentType[]?

import { privateEndpointSingleServiceType } from 'br/public:avm/utl/types/avm-common-types:0.5.1'
@description('Optional. Configuration details for private endpoints. For security reasons, it is recommended to use private endpoints whenever possible.')
param privateEndpoints privateEndpointSingleServiceType[]?

@description('Optional. Resource tags.')
param tags object?

// import { diagnosticSettingFullType } from 'br/public:avm/utl/types/avm-common-types:0.5.1'
// @description('Optional. The diagnostic settings of the service.')
// param diagnosticSettings diagnosticSettingFullType[]?

// @description('Optional. Enable/Disable usage telemetry for module.')
// param enableTelemetry bool = true

// =========== //
// Variables   //
// =========== //

// var enableReferencedModulesTelemetry = false

var builtInRoleNames = {
  Contributor: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  'Key Vault Administrator': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '00482a5a-887f-4fb3-b363-3b7fe8e74483'
  )
  'Key Vault Certificates Officer': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'a4417e6f-fecd-4de8-b567-7b0420556985'
  )
  'Key Vault Certificate User': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'db79e9a7-68ee-4b58-9aeb-b90e7c24fcba'
  )
  'Key Vault Contributor': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'f25e0fa2-a7c8-4377-a976-54943a77a395'
  )
  'Key Vault Crypto Officer': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '14b46e9e-c2b7-41b4-b07b-48a6ebf60603'
  )
  'Key Vault Crypto Service Encryption User': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'e147488a-f6f5-4113-8e2d-b22465e65bf6'
  )
  'Key Vault Crypto User': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '12338af0-0e69-4776-bea7-57ae8d297424'
  )
  'Key Vault Reader': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '21090545-7ca7-4776-b22c-e363652d74d2'
  )
  'Key Vault Secrets Officer': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'b86a8fe4-44ce-4948-aee5-eccb2c155cd7'
  )
  'Key Vault Secrets User': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '4633458b-17de-408a-b874-0445c86b69e6'
  )
  Owner: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8e3af657-a8ff-443c-a75c-2fe8c4bcb635')
  Reader: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'acdd72a7-3385-48ef-bd42-f606fba81ae7')
  'Role Based Access Control Administrator': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    'f58310d9-a9f6-439a-9e8d-f62e7b41a168'
  )
  'User Access Administrator': subscriptionResourceId(
    'Microsoft.Authorization/roleDefinitions',
    '18d7d88d-d35e-4fb5-a5c3-7773c20a72d9'
  )
}

var formattedRoleAssignments = [
  for (roleAssignment, index) in (roleAssignments ?? []): union(roleAssignment, {
    roleDefinitionId: builtInRoleNames[?roleAssignment.roleDefinitionIdOrName] ?? (contains(
        roleAssignment.roleDefinitionIdOrName,
        '/providers/Microsoft.Authorization/roleDefinitions/'
      )
      ? roleAssignment.roleDefinitionIdOrName
      : subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleAssignment.roleDefinitionIdOrName))
  })
]

var formattedAccessPolicies = [
  for accessPolicy in (accessPolicies ?? []): {
    applicationId: accessPolicy.?applicationId ?? ''
    objectId: accessPolicy.objectId
    permissions: accessPolicy.permissions
    tenantId: accessPolicy.?tenantId ?? tenant().tenantId
  }
]

// ============ //
// Dependencies //
// ============ //

// #disable-next-line no-deployments-resources
// resource avmTelemetry 'Microsoft.Resources/deployments@2024-03-01' = if (enableTelemetry) {
//   name: '46d3xbcp.res.keyvault-vault.${replace('-..--..-', '.', '-')}.${substring(uniqueString(deployment().name, location), 0, 4)}'
//   properties: {
//     mode: 'Incremental'
//     template: {
//       '$schema': 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#'
//       contentVersion: '1.0.0.0'
//       resources: []
//       outputs: {
//         telemetry: {
//           type: 'String'
//           value: 'For more information, see https://aka.ms/avm/TelemetryInfo'
//         }
//       }
//     }
//   }
// }

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true
    createMode: createMode
    enablePurgeProtection: true
    tenantId: subscription().tenantId
    accessPolicies: formattedAccessPolicies
    sku: {
      name: sku
      family: 'A'
    }
    networkAcls: !empty(networkAcls ?? {})
      ? {
          bypass: networkAcls.?bypass
          defaultAction: networkAcls.?defaultAction
          virtualNetworkRules: networkAcls.?virtualNetworkRules ?? []
          ipRules: networkAcls.?ipRules ?? []
        }
      : null
    publicNetworkAccess: !empty(publicNetworkAccess)
      ? publicNetworkAccess
      : ((!empty(privateEndpoints ?? []) && empty(networkAcls ?? {})) ? 'Disabled' : null)
  }
}

resource keyVault_roleAssignments 'Microsoft.Authorization/roleAssignments@2022-04-01' = [
  for (roleAssignment, index) in (formattedRoleAssignments ?? []): {
    name: roleAssignment.?name ?? guid(keyVault.id, roleAssignment.principalId, roleAssignment.roleDefinitionId)
    properties: {
      roleDefinitionId: roleAssignment.roleDefinitionId
      principalId: roleAssignment.principalId
      description: roleAssignment.?description
      principalType: roleAssignment.?principalType
      condition: roleAssignment.?condition
      conditionVersion: !empty(roleAssignment.?condition) ? (roleAssignment.?conditionVersion ?? '2.0') : null // Must only be set if condtion is set
      delegatedManagedIdentityResourceId: roleAssignment.?delegatedManagedIdentityResourceId
    }
    scope: keyVault
  }
]

// =========== //
// Outputs     //
// =========== //
@description('The resource ID of the key vault.')
output resourceId string = keyVault.id

@description('The name of the resource group the key vault was created in.')
output resourceGroupName string = resourceGroup().name

@description('The name of the key vault.')
output name string = keyVault.name

@description('The URI of the key vault.')
output uri string = keyVault.properties.vaultUri

@description('The location the resource was deployed into.')
output location string = keyVault.location

// @description('The private endpoints of the key vault.')
// output privateEndpoints privateEndpointOutputType[] = [
//   for (item, index) in (privateEndpoints ?? []): {
//     name: keyVault_privateEndpoints[index].outputs.name
//     resourceId: keyVault_privateEndpoints[index].outputs.resourceId
//     groupId: keyVault_privateEndpoints[index].outputs.?groupId!
//     customDnsConfigs: keyVault_privateEndpoints[index].outputs.customDnsConfigs
//     networkInterfaceResourceIds: keyVault_privateEndpoints[index].outputs.networkInterfaceResourceIds
//   }
// ]

// ================ //
// Definitions      //
// ================ //
@export()
type privateEndpointOutputType = {
  @description('The name of the private endpoint.')
  name: string

  @description('The resource ID of the private endpoint.')
  resourceId: string

  @description('The group Id for the private endpoint Group.')
  groupId: string?

  @description('The custom DNS configurations of the private endpoint.')
  customDnsConfigs: {
    @description('FQDN that resolves to private endpoint IP address.')
    fqdn: string?

    @description('A list of private IP addresses of the private endpoint.')
    ipAddresses: string[]
  }[]

  @description('The IDs of the network interfaces associated with the private endpoint.')
  networkInterfaceResourceIds: string[]
}

@export()
@description('The type for a credential output.')
type credentialOutputType = {
  @description('The item\'s resourceId.')
  resourceId: string

  @description('The item\'s uri.')
  uri: string

  @description('The item\'s uri with version.')
  uriWithVersion: string
}

@export()
@description('The type for an access policy.')
type accessPolicyType = {
  @description('Optional. The tenant ID that is used for authenticating requests to the key vault.')
  tenantId: string?

  @description('Required. The object ID of a user, service principal or security group in the tenant for the vault.')
  objectId: string

  @description('Optional. Application ID of the client making request on behalf of a principal.')
  applicationId: string?

  @description('Required. Permissions the identity has for keys, secrets and certificates.')
  permissions: {
    @description('Optional. Permissions to keys.')
    keys: (
      | 'all'
      | 'backup'
      | 'create'
      | 'decrypt'
      | 'delete'
      | 'encrypt'
      | 'get'
      | 'getrotationpolicy'
      | 'import'
      | 'list'
      | 'purge'
      | 'recover'
      | 'release'
      | 'restore'
      | 'rotate'
      | 'setrotationpolicy'
      | 'sign'
      | 'unwrapKey'
      | 'update'
      | 'verify'
      | 'wrapKey')[]?

    @description('Optional. Permissions to secrets.')
    secrets: ('all' | 'backup' | 'delete' | 'get' | 'list' | 'purge' | 'recover' | 'restore' | 'set')[]?

    @description('Optional. Permissions to certificates.')
    certificates: (
      | 'all'
      | 'backup'
      | 'create'
      | 'delete'
      | 'deleteissuers'
      | 'get'
      | 'getissuers'
      | 'import'
      | 'list'
      | 'listissuers'
      | 'managecontacts'
      | 'manageissuers'
      | 'purge'
      | 'recover'
      | 'restore'
      | 'setissuers'
      | 'update')[]?

    @description('Optional. Permissions to storage accounts.')
    storage: (
      | 'all'
      | 'backup'
      | 'delete'
      | 'deletesas'
      | 'get'
      | 'getsas'
      | 'list'
      | 'listsas'
      | 'purge'
      | 'recover'
      | 'regeneratekey'
      | 'restore'
      | 'set'
      | 'setsas'
      | 'update')[]?
  }
}

@export()
@description('The type for a secret output.')
type secretType = {
  @description('Required. The name of the secret.')
  name: string

  @description('Optional. Resource tags.')
  tags: object?

  @description('Optional. Contains attributes of the secret.')
  attributes: {
    @description('Optional. Defines whether the secret is enabled or disabled.')
    enabled: bool?

    @description('Optional. Defines when the secret will become invalid. Defined in seconds since 1970-01-01T00:00:00Z.')
    exp: int?

    @description('Optional. If set, defines the date from which onwards the secret becomes valid. Defined in seconds since 1970-01-01T00:00:00Z.')
    nbf: int?
  }?
  @description('Optional. The content type of the secret.')
  contentType: string?

  @description('Required. The value of the secret. NOTE: "value" will never be returned from the service, as APIs using this model are is intended for internal use in ARM deployments. Users should use the data-plane REST service for interaction with vault secrets.')
  @secure()
  value: string

  @description('Optional. Array of role assignments to create.')
  roleAssignments: roleAssignmentType[]?
}

@export()
@description('The type for a key.')
type keyType = {
  @description('Required. The name of the key.')
  name: string

  @description('Optional. Resource tags.')
  tags: object?

  @description('Optional. Contains attributes of the key.')
  attributes: {
    @description('Optional. Defines whether the key is enabled or disabled.')
    enabled: bool?

    @description('Optional. Defines when the key will become invalid. Defined in seconds since 1970-01-01T00:00:00Z.')
    exp: int?

    @description('Optional. If set, defines the date from which onwards the key becomes valid. Defined in seconds since 1970-01-01T00:00:00Z.')
    nbf: int?
  }?
  @description('Optional. The elliptic curve name. Only works if "keySize" equals "EC" or "EC-HSM". Default is "P-256".')
  curveName: ('P-256' | 'P-256K' | 'P-384' | 'P-521')?

  @description('Optional. The allowed operations on this key.')
  keyOps: ('decrypt' | 'encrypt' | 'import' | 'release' | 'sign' | 'unwrapKey' | 'verify' | 'wrapKey')[]?

  @description('Optional. The key size in bits. Only works if "keySize" equals "RSA" or "RSA-HSM". Default is "4096".')
  keySize: (2048 | 3072 | 4096)?

  @description('Optional. The type of the key. Default is "EC".')
  kty: ('EC' | 'EC-HSM' | 'RSA' | 'RSA-HSM')?

  @description('Optional. Key release policy.')
  releasePolicy: {
    @description('Optional. Content type and version of key release policy.')
    contentType: string?

    @description('Optional. Blob encoding the policy rules under which the key can be released.')
    data: string?
  }?

  @description('Optional. Key rotation policy.')
  rotationPolicy: rotationPolicyType?

  @description('Optional. Array of role assignments to create.')
  roleAssignments: roleAssignmentType[]?
}

@description('The type for a rotation policy.')
type rotationPolicyType = {
  @description('Optional. The attributes of key rotation policy.')
  attributes: {
    @description('Optional. The expiration time for the new key version. It should be in ISO8601 format. Eg: "P90D", "P1Y".')
    expiryTime: string?
  }?

  @description('Optional. The lifetimeActions for key rotation action.')
  lifetimeActions: {
    @description('Optional. The action of key rotation policy lifetimeAction.')
    action: {
      @description('Optional. The type of action.')
      type: ('Notify' | 'Rotate')?
    }?

    @description('Optional. The trigger of key rotation policy lifetimeAction.')
    trigger: {
      @description('Optional. The time duration after key creation to rotate the key. It only applies to rotate. It will be in ISO 8601 duration format. Eg: "P90D", "P1Y".')
      timeAfterCreate: string?

      @description('Optional. The time duration before key expiring to rotate or notify. It will be in ISO 8601 duration format. Eg: "P90D", "P1Y".')
      timeBeforeExpiry: string?
    }?
  }[]?
}
