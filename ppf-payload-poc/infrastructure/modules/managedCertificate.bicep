param tags object
param location string = resourceGroup().location
param containerEnvironmentName string
param customHostname string

resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerEnvironmentName
}

resource certificate 'Microsoft.App/managedEnvironments/managedCertificates@2024-10-02-preview' = {
  parent: containerEnvironment
  location: location
  name: customHostname
  tags: tags
  properties: {
    subjectName: customHostname
    domainControlValidation: 'CNAME'
  }
}

output id string = certificate.id
