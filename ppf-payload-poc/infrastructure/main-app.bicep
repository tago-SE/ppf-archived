targetScope = 'subscription'

@allowed(['dev', 'test', 'prod'])
param env string
@allowed(['westeurope'])
param location string = 'westeurope'
// App
param systemCode string = 'AISPPAT'
param emailResponsible string = 'FMITLego@if.no'
param appPrefix string
param developerGroupId string
param logWorkspaceName string
@secure()
param secretsJson string = ''
param envVariablesJson string = ''
param containerImage string = 'mcr.microsoft.com/k8se/quickstart:latest'
param targetPort int = 3000
param certificateId string = ''

// Common
param commonResourceGroupName string
param containerEnvironmentName string
param registryIdentityName string
param dbIdentityName string
param registryName string
param storageName string
param natGatewayPublicIPAddressName string
// DNS
// @description('Optional. When set to true it will create new TXT & CNAME records')
// param newCertificate bool = false // Perhaps can be combined with if the app is deployed for the first time or not
@allowed(['ppf.ifext.biz'])
param dnsZoneName string = 'ppf.ifext.biz'
@allowed(['portal', 'cms'])
param ppfAppType string = 'cms'

param certKeyVaultRG string = 'DomainServices'
param certKeyVaultSubscription string = '394c5ffc-bb30-4199-80b4-454ce4510dba'


param serviceMsGraphIdentityResourceId string = ''

var commonRG = resourceGroup(commonResourceGroupName)
var abbr = loadJsonContent('./lib/abbreviations.json')
var deploymentPrefix = '${deployment().name}-${env}'

// App 
var appHandle = '${appPrefix}-${env}'
var resourceGroupName = '${appHandle}-${abbr.resourcesResourceGroups}'
var appName = '${appHandle}-${abbr.appContainerApps}'
var appIdentityName = '${appName}-${abbr.managedIdentityUserAssignedIdentities}'
var appInsightsName = '${appHandle}-${abbr.insightsComponents}'

var nameRecord = '${ppfAppType}.${env}'
// var nameRecord_wildcard = '${appPrefix}.${ppfAppType}.${env}'

var customHostname = '${nameRecord}.${dnsZoneName}'

var emptyCertificateId = empty(certificateId)

// var certificateName = '${env}-${replace(dnsZoneName, '.', '-')}'
// var certificateName_wildcard = 'wildcard-${ppfAppType}-${env}-${replace(dnsZoneName, '.', '-')}'

var tags = {
  ITSystemCode: systemCode
  Responsible: emailResponsible
  Environment: env
  FQDN: customHostname
  NameRecord: nameRecord
  // Certificate: certificateName
}

resource appRG 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module appRG_rbac './modules/shared/rbac.bicep' = {
  name: '${deployment().name}-appRG-rbac'
  scope: appRG
  params: {
    principalId: developerGroupId
    principalType: 'Group'
    roleDefinitionName: 'Contributor'
  }
}

// @2024-05-01
resource publicIP 'Microsoft.Network/publicIPAddresses@2022-05-01' existing = {
  scope: commonRG
  name: natGatewayPublicIPAddressName
}

resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerEnvironmentName
  scope: commonRG
}

// 
module asuidRecord './modules/dns-txt.bicep' = if (emptyCertificateId) {
  name: '${deployment().name}-asuid'
  scope: resourceGroup(certKeyVaultSubscription, certKeyVaultRG)
  params: {
    dnsZoneName: dnsZoneName
    ttl: 60
    txtRecord: 'asuid.${nameRecord}'
    txtRecordValue: containerEnvironment.properties.customDomainConfiguration.customDomainVerificationId
  }
}

// This will be a problem right...?
module cnameRecord './modules/dns-cname.bicep' = {
  name: '${deployment().name}-cname'
  scope: resourceGroup(certKeyVaultSubscription, certKeyVaultRG)
  params: {
    cnameRecord: nameRecord
    dnsZoneName: dnsZoneName
    cnameRecordValue: appUpdated.outputs.fqdn
  }
}

module appFirstRun './modules/containerapp.bicep' = if (emptyCertificateId) {
  name: '${deploymentPrefix}-${abbr.appContainerApps}-firstRun'
  scope: resourceGroup(appRG.name)
  dependsOn: [asuidRecord]
  params: {
    env: env
    tags: tags
    name: appName
    location: location
    targetPort: targetPort
    commonResourceGroupName: commonResourceGroupName
    registryName: registryName
    storageName: storageName
    containerEnvironmentName: containerEnvironmentName
    secretsJson: secretsJson
    envVariablesJson: envVariablesJson
    appIdentityName: appIdentityName
    registryIdentityName: registryIdentityName
    appInsightsName: appInsightsName
    developerGroupId: developerGroupId
    image: containerImage
    natGatewayPublicIPAddressName: publicIP.name
    natGatewayPublicIPAddress: publicIP.properties.ipAddress
    logWorkspaceName: logWorkspaceName
    dbIdentityName: dbIdentityName
    customHostname: customHostname
    serviceMsGraphIdentityResourceId: serviceMsGraphIdentityResourceId
    certificateId: ''
  }
}

module containerEnvironmentCert './modules/managedCertificate.bicep' = if (emptyCertificateId) {
  name: '${deployment().name}-${abbr.appManagedEnvironments}-cert'
  scope: commonRG
  params: {
    tags: tags
    containerEnvironmentName: containerEnvironmentName
    location: location
    customHostname: appFirstRun.outputs.customHostname // App must have been created before
  }
}

// 'Not found CNAME of hostname \'cms.dev.ppf.ifext.biz\' directly pointing to a default hostname. 
// Found CNAME record(s) of the hostname are portal-plcms-ppf-if-eu.portal.dev.ppf.ifext.biz.'

module appUpdated './modules/containerapp.bicep' = {
  name: '${deploymentPrefix}-${abbr.appContainerApps}'
  scope: resourceGroup(appRG.name)
  params: {
    env: env
    tags: tags
    name: appName
    location: location
    targetPort: targetPort
    commonResourceGroupName: commonResourceGroupName
    registryName: registryName
    storageName: storageName
    containerEnvironmentName: containerEnvironmentName
    secretsJson: secretsJson
    envVariablesJson: envVariablesJson
    appIdentityName: appIdentityName
    registryIdentityName: registryIdentityName
    appInsightsName: appInsightsName
    developerGroupId: developerGroupId
    image: containerImage
    natGatewayPublicIPAddressName: publicIP.name
    natGatewayPublicIPAddress: publicIP.properties.ipAddress
    logWorkspaceName: logWorkspaceName
    dbIdentityName: dbIdentityName
    customHostname: customHostname
    certificateId: emptyCertificateId ? containerEnvironmentCert.outputs.id : certificateId
    serviceMsGraphIdentityResourceId: serviceMsGraphIdentityResourceId
  }
}

// =============== //
//   Outputs       //
// =============== //

output fqdn string = appUpdated.outputs.fqdn
