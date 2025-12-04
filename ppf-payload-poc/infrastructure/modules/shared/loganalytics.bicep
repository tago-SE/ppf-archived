param name string

@description('Optional. Location for all resources.')
param location string = resourceGroup().location

resource law 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  location: location
  name: name
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

output name string = law.name
output id string = law.id
