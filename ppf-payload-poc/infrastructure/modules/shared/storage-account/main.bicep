// https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/storage/storage-account

metadata name = 'Storage Accounts'
metadata description = 'This module deploys a Storage Account.'

param storageName string

@description('Optional. Log Analaytics Workspace.')
param workspaceResourceId string = ''

@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Premium_LRS'
  'Premium_ZRS'
  'Standard_GZRS'
  'Standard_RAGZRS'
])
@description('Optional. Storage Account Sku Name.')
param skuName string = 'Standard_RAGRS'

@description('Optional. Location for all resources.')
param location string = resourceGroup().location

@allowed([
  'Storage'
  'StorageV2'
  'BlobStorage'
  'FileStorage'
  'BlockBlobStorage'
])
@description('Optional. Type of Storage Account to create.')
param kind string = 'StorageV2'

@allowed([
  'Premium'
  'Hot'
  'Cool'
  'Cold'
])
@description('Conditional. Required if the Storage Account kind is set to BlobStorage. The access tier is used for billing. The "Premium" access tier is the default value for premium block blobs storage account type and it cannot be changed for the premium block blobs storage account type.')
param accessTier string = 'Hot'

@allowed([
  'TLS1_2'
  'TLS1_3'
])
@description('Optional. Set the minimum TLS version on request to storage. The TLS versions 1.0 and 1.1 are deprecated and not supported anymore.')
param minimumTlsVersion string = 'TLS1_2'

@description('Optional. Tags of the resource.')
param tags object?

@description('Optional. Sets the IP ACL rules.')
param ipRules array = []

@description('Optional. Sets the Virtual Network rules. { id: {subnetId}, action: "Allow" }')
param virtualNetworkRules array = []

param blobServiceName string = 'default'

param blobContainerNames array = ['media']

//Microsoft.Storage/storageAccounts@2023-05-01
resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: storageName
  location: location
  kind: kind
  sku: {
    name: skuName
  }
  tags: tags
  properties: {
    dnsEndpointType: 'Standard'
    defaultToOAuthAuthentication: false
    publicNetworkAccess: 'Enabled'
    allowCrossTenantReplication: false
    routingPreference: {
      routingChoice: 'InternetRouting'
      publishMicrosoftEndpoints: true
      publishInternetEndpoints: true
    }
    minimumTlsVersion: minimumTlsVersion
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    largeFileSharesState: 'Enabled'
    networkAcls: {
      bypass: 'Logging, Metrics, AzureServices'
      defaultAction: 'Deny'
      resourceAccessRules: []
      virtualNetworkRules: virtualNetworkRules
      ipRules: ipRules
    }
    supportsHttpsTrafficOnly: true
    accessTier: (kind != 'Storage' && kind != 'BlockBlobStorage') ? accessTier : null
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2024-01-01' = {
  parent: storageAccount
  name: blobServiceName
  properties: {
    deleteRetentionPolicy: {
      allowPermanentDelete: true
      enabled: true
      days: 7
    }
    restorePolicy: {
      enabled: false
      days: 6
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource diagnosticsBlob 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (workspaceResourceId != '') {
  scope: blobService
  name: '${storageName}-blob'
  properties: {
    workspaceId: workspaceResourceId
    logs: [
      {
        category: null
        categoryGroup: 'audit'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'Transaction'
        timeGrain: null
        enabled: true
      }
    ]
  }
}

resource media_blobServiceContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2024-01-01' = [
  for containerName in blobContainerNames: {
    parent: blobService
    name: containerName
    properties: {
      immutableStorageWithVersioning: {
        enabled: false
      }
      defaultEncryptionScope: '$account-encryption-key'
      denyEncryptionScopeOverride: false
      publicAccess: 'None'
    }
  }
]

// =============== //
//   Outputs       //
// =============== //

output id string = storageAccount.id
output name string = storageAccount.name
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
output primaryMicrosoftBlobEndpoint string = storageAccount.properties.primaryEndpoints.microsoftEndpoints.blob
