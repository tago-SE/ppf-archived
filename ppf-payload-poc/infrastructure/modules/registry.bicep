param location string
param registryName string

@description('The user-assigned identity shared by ContainerApps to access the registry')
param registryIdentityName string

@description('Optional. Tags of the resource.')
param tags object?

resource registryIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: registryIdentityName
  location: location
  tags: tags
}

module registry './shared/registry/main.bicep' = {
  name: '${deployment().name}-${uniqueString(registryName)}'
  params: {
    tags: tags
    name: registryName
    location: location
    roleAssignments: [
      // Maybe we do not need to use this and can obtain the access token in the pipeline..?
      {
        principalId: deployer().objectId
        roleDefinitionIdOrName: 'AcrPush'
        principalType: 'ServicePrincipal'
        description: 'Grant Deployer AcrPush'
      }
      //
      {
        principalId: registryIdentity.properties.principalId
        roleDefinitionIdOrName: 'AcrPush'
        principalType: 'ServicePrincipal'
        description: 'Grant Common Registry Identity AcrPush'
      }
      {
        principalId: registryIdentity.properties.principalId
        roleDefinitionIdOrName: 'AcrPull'
        principalType: 'ServicePrincipal'
        description: 'Grant Common Registry Identity AcrPull'
      }
    ]
  }
}

// =============== //
//   Outputs       //
// =============== //

output registryIdentityName string = registryIdentity.name
output registryName string = registry.outputs.name
