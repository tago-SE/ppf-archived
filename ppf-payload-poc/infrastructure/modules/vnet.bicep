@minLength(1)
param baseNameWithEnv string
param vnetName string
param location string
param abbreviations object = {}
param tags object?
param setupNatGateway bool = true

@description('Array with address space, defaults to 10.0.0.0/16')
param addressSpace array = [
  '10.0.0.0/16'
]

param containerSubnetName string
@description('Subnet Address Prefix (CIDR notation, /24 or greater, default 10.0.0.0/18)')
param containerSubnetAddressPrefix string = '10.0.0.0/18' // 10.0.0.1 - 10.0.63.254

param serviceSubnetName string
@description('Subnet Address Prefix (CIDR notation, /24 or greater, default 10.0.64.0/18)')
param serviceSubnetAddressPrefix string = '10.0.64.0/18' //10.0.64.1 - 10.0.127.254

resource publicIP 'Microsoft.Network/publicIPAddresses@2022-05-01' = if (setupNatGateway) {
  name: '${baseNameWithEnv}-${abbreviations.networkPublicIPAddresses}'
  location: location
  tags: tags
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}

resource natGW 'Microsoft.Network/natGateways@2022-05-01' = if (setupNatGateway) {
  name: '${baseNameWithEnv}-${abbreviations.networkNatGateways}'
  location: location
  tags: union(tags ?? {}, {
    'eslz-pip-purpose': 'nat-gateway'
  })
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIpAddresses: [
      {
        id: publicIP.id
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2022-05-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: addressSpace
    }
    subnets: [
      {
        name: containerSubnetName
        properties: {
          addressPrefix: containerSubnetAddressPrefix
          // Maybe add PostgresQL here 
          serviceEndpoints: [{ service: 'Microsoft.Storage' }, { service: 'Microsoft.KeyVault' }]
          delegations: [
            {
              name: 'Microsoft.App.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
          natGateway: setupNatGateway
            ? {
                id: natGW.id
              }
            : null
        }
      }
      {
        name: serviceSubnetName
        properties: {
          addressPrefix: serviceSubnetAddressPrefix
          delegations: []
          serviceEndpoints: [{ service: 'Microsoft.Storage' }, { service: 'Microsoft.KeyVault' }]
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
      }
    ]
  }
}

output vnetName string = vnet.name
output subnets array = vnet.properties.subnets
output natGatewayIp object = setupNatGateway
  ? {
      name: natGW.name
      startaddress: publicIP.properties.ipAddress
      endaddress: publicIP.properties.ipAddress
      cidr: '${publicIP.properties.ipAddress}/32'
      rule: 'Allow'
      priority: 1000
    }
  : {}
