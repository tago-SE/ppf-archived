using Microsoft.Graph;
using Azure.Identity;
using Microsoft.Extensions.Options;
using WebPortal.Server.Configuration;
using Microsoft.Kiota.Abstractions.Authentication;

namespace WebPortal.Server.Integrations.MsGraph;

public static class GraphConfiguration
{
    public static void AddMsGraphClient(this IServiceCollection services, bool isProduction)
    {
        services.AddScoped(serviceProvider =>
        {
            var credentials = isProduction ? CreateProductionCredentials(serviceProvider) : CreateDevelopmentCredentials();
            return new GraphServiceClient(credentials);
        });
    }

    private static ChainedTokenCredential CreateProductionCredentials(IServiceProvider serviceProvider)
    {
        var options = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
        var managedIdentity = new ManagedIdentityCredential(options.Identity.ClientId);
        return new ChainedTokenCredential(managedIdentity);
    }

    private static ChainedTokenCredential CreateDevelopmentCredentials()
    {
        return new ChainedTokenCredential(new VisualStudioCredential(), new VisualStudioCodeCredential(), new DefaultAzureCredential());
    }
}
