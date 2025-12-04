# Managing Templates (Notes)

## Publishing packge

Navigate to the `/templates` folder and run:

```bash
dotnet pack
dotnet nuget push --source "ppf-portal-starter" --api-key az .\bin\Release\PartnerPortalFrameworkTemplates.*.nupkg --skip-duplicate
```

## Pipeline Packages (Add these?)

  <!-- - stage: nuget
    displayName: "Create and Publish Nuget Package"
    jobs:
      - job: nuget
        displayName: "Create And Publish Nuget Package"
        steps:
          - task: NuGetAuthenticate@1
            displayName: Configure NuGet authentication
            inputs:
              forceReinstallCredentialProvider: true

          - task: DotNetCoreCLI@2
            displayName: Create nuget package
            inputs:
              command: pack
              packagesToPack: "**/Claims.Orchestrator.MessagingContracts.csproj"
              configuration: Release
              versioningScheme: "byEnvVar"
              versionEnvVar: Build.BuildNumber
              packDirectory: artifacts
              includeSymbols: true
              includeSource: true

          - task: NuGetCommand@2
            displayName: Push to claims-services
            inputs:
              command: "push"
              packagesToPush: "artifacts/**/*.symbols.nupkg"
              publishVstsFeed: "claims-services"

          - task: NuGetCommand@2
            displayName: Push to myget
            inputs:
              command: push
              packagesToPush: "artifacts/**/*.symbols.nupkg"
              nuGetFeedType: external
              publishFeedCredentials: "MyGet Push"

          - task: DotNetCoreCLI@2
            displayName: Push to kaizen
            inputs:
              command: push
              packagesToPush: "artifacts/**/*.symbols.nupkg"
              publishVstsFeed: d89f964a-363d-4f70-9427-bd850eb5e043 -->
