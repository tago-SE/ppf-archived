param location string
param name string

@description('Optional. Tags of the resource.')
param tags object?

resource userIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: name
  location: location
  tags: tags
}

output id string = userIdentity.id
output name string = userIdentity.name
output principalId string = userIdentity.properties.principalId
output clientId string = userIdentity.properties.clientId
output tenantId string = userIdentity.properties.tenantId
