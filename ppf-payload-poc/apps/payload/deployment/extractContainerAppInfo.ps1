#
#   TODO: Move pipelines here and simplify library group mapping
#

# param(
#     [Parameter(Mandatory = $true)]
#     [string]$containerResourceGroupName,
#     [Parameter(Mandatory = $true)]
#     [string]$containerAppName
# )

# $appIdentitySuffixes = @{
#     AppIdentity      = "$containerAppName-id"
#     RegistryIdentity = "-cr-id"
#     DatabaseIdentity = "-psql-id"
#     MsgraphIdentity  = "-msgraph-id"
# }

# $resolvedIdentities = @{
#     AppIdentity      = $null
#     RegistryIdentity = $null
#     DatabaseIdentity = $null
#     MsgraphIdentity  = $null
# }

# function MatchIdentity {
#     param (
#         [string]$identityName,
#         $identityValue
#     )
#     if ($identityName -eq $appIdentitySuffixes.AppIdentity) {
#         Write-Host "AppIdentity: $identityName"
#         $resolvedIdentities.AppIdentity = $identityValue
#     }
#     elseif ($identityName.EndsWith($appIdentitySuffixes.RegistryIdentity)) {
#         Write-Host "RegistryIdentity: $identityName"
#         $resolvedIdentities.RegistryIdentity = $identityValue
#     }
#     elseif ($identityName.EndsWith($appIdentitySuffixes.DatabaseIdentity)) {
#         Write-Host "DatabaseIdentity: $identityName"
#         $resolvedIdentities.DatabaseIdentity = $identityValue
#     }
#     elseif ($identityName.EndsWith($appIdentitySuffixes.MsgraphIdentity)) {
#         Write-Host "MsgraphIdentity: $identityName"
#         $resolvedIdentities.MsgraphIdentity = $identityValue
#     }
#     else {
#         Write-Host "$identityName skipped"
#     }
# }

# Write-Host "Checking if container app '$containerAppName' exists in resource group '$containerResourceGroupName'..."

# try {
#     $containerApp = az containerapp show --resource-group $containerResourceGroupName --name $containerAppName | ConvertFrom-Json
#     if ($containerApp.properties.configuration.ingress.customDomains.Count -gt 0) {
#         $friendlyHostname = $containerApp.properties.configuration.ingress.customDomains[0].name
#     }
#     else {
#         $friendlyHostname = $containerApp.properties.configuration.ingress.fqdn
#     }
#     Write-Host "Container App found:"
#     Write-Host "   Name: $($containerApp.name)"
#     Write-Host "   Domain: https://$friendlyHostname"
#     Write-Host "   Location: $($containerApp.location)"
#     Write-Host "   Status: $($containerApp.properties.provisioningState)"

#     $userAssignedIdentities = $containerApp.identity.userAssignedIdentities    
#     if ($null -ne $userAssignedIdentities -and $userAssignedIdentities.PSObject.Properties.Count -gt 0) {
#         Write-Host "User-assigned identities:"
#         foreach ($identity in $userAssignedIdentities.PSObject.Properties) {
#             $identityKey = $identity.Name
#             $identityName = ($identityKey -split "/")[-1]
#             MatchIdentity -identityName $identityName -identityValue $identity.Value
#         }
#     }
#     else {
#         Write-Host "No user-assigned identities found."
#         exit 1
#     }
#     # Validate that all required identities are resolved
#     foreach ($key in $resolvedIdentities.Keys) {
#         if (-not $resolvedIdentities[$key]) {
#             Write-Error "$key was not resolved."
#             exit 1
#         }
#     }
# }
# catch {
#     Write-Warning "Container App '$containerAppName' not found in '$containerResourceGroupName'."
#     exit 1
# }
    

# # Container App KeyVault
# $keyVaults = az keyvault list --resource-group $containerResourceGroupName | ConvertFrom-Json
# if ($keyVaults.Count -ne 1) {
#     Write-Error "Expected exactly 1 Key Vault in '$containerResourceGroupName', but found $($keyVaults.Count)."
#     exit 1
# }
# else {
#     $kv = $keyVaults[0]
#     Write-Host "   KeyVaultName: $($kv.name)"
# }

# # Appinsights

# try {
#     $appInsightsName = $containerAppName.Substring(0, $containerAppName.Length - 3) + "-appi"
#     Write-Host "Derived Application Insights name: $appInsightsName"
#     $appiConnectionString = (
#         az monitor app-insights component show --resource-group $containerResourceGroupName --app $appInsightsName | ConvertFrom-Json
#     ).connectionString

#     if ([string]::IsNullOrWhiteSpace($appiConnectionString)) {
#         Write-Error "Failed to retrieve Application Insights connection string."
#         exit 1
#     }

#     Write-Host "App Insights Connection String: $appiConnectionString"
# }
# catch {
#     Write-Error "Error retrieving Application Insights connection string for '$appInsightsName' in '$containerResourceGroupName'."
#     exit 1
# }


# Write-Host "##vso[task.setvariable variable=appiConnectionString]$appiConnectionString"
# Write-Host "##vso[task.setvariable variable=keyVaultName]$($kv.name)"
# Write-Host "##vso[task.setvariable variable=customDomain]$friendlyHostname"
# Write-Host "##vso[task.setvariable variable=appiConnectionString]$appiConnectionString"

# Write-Host "##vso[task.setvariable variable=appIdentity]$($resolvedIdentities.AppIdentity)"
# Write-Host "##vso[task.setvariable variable=registryIdentity]$($resolvedIdentities.RegistryIdentity)"
# Write-Host "##vso[task.setvariable variable=databaseIdentity]$($resolvedIdentities.DatabaseIdentity)"
# Write-Host "##vso[task.setvariable variable=msgraphIdentity]$($resolvedIdentities.MsgraphIdentity)"