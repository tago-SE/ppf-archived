param (
    [string]$parameterFilePath
)

# Load and parse the parameter file
if (-Not (Test-Path $parameterFilePath)) {
    Write-Error "Parameter file not found at path: $parameterFilePath"
    exit 1
}

Write-Host "path: $parameterFilePath"
$jsonContent = Get-Content $parameterFilePath -Raw | ConvertFrom-Json


# Extract parameters
$env = $jsonContent.parameters.env.value
$appPrefix = $jsonContent.parameters.appPrefix.value
$containerImage = $jsonContent.parameters.containerImage.value

$dnsZone = "ppf.ifext.biz"

$abbr = @{
    resourcesResourceGroups = "rg"
    appContainerApps = "ca"
}

# Derive values
$appHandle = "$appPrefix-$env"
$resourceGroupName = "$appHandle-$($abbr.resourcesResourceGroups)"
$appName = "$appHandle-$($abbr.appContainerApps)"

Write-Host "env                 = $env"
Write-Host "appHandle           = $appHandle"
Write-Host "resourceGroupName   = $resourceGroupName"
Write-Host "appName             = $appName"

$customHostname = "cms.$env.$dnsZone"

$showContainerApp = "az containerapp show --resource-group $resourceGroupName --name $appName --show-secrets"
$containerApp = Invoke-Expression -Command $showContainerApp | ConvertFrom-Json

# Defaults
$certificateId = ""
$containerImage = "mcr.microsoft.com/k8se/quickstart:latest" 

if($null -ne $containerApp) {
    $containerImage = $containerApp.properties.template.containers.image
    # $secrets = $containerApp.properties.configuration.secrets
    # $env = $containerApp.properties.template.containers
    $customDomains = $containerApp.properties.configuration.ingress.customDomains
    $matchingDomain = $customDomains | Where-Object { $_.name -eq $customHostname }
    if ($matchingDomain) {
        $certificateId = $matchingDomain.certificateId
    } else {
        Write-Error "No matching custom domain found for $customHostname"
    }
} 

Write-Host "containerImage      = $containerImage"
Write-Host "customHostname      = $customHostname"
Write-Host "certificateId       = $certificateId"

$jsonContent.parameters.containerImage.value = $containerImage
$jsonContent.parameters.certificateId.value = $certificateId

$jsonContent | ConvertTo-Json -Depth 10 | Out-File -FilePath $parameterFilePath -Encoding utf8

Write-Host "Updated parameters written back to $parameterFilePath"