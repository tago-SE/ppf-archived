namespace dotnet.Server.Infrastructure.Appinsights;

public static class ApplicationInsightExtensions
{
    public static WebApplicationBuilder ConfigureApplicationInsights(this WebApplicationBuilder builder)
    {
        var applicationInsightsSection = builder.Configuration.GetSection(ApplicationInsightOptions.ApplicationInsightsSectionName);
        builder.Services.Configure<ApplicationInsightOptions>(applicationInsightsSection);
        builder.Services.AddApplicationInsightsTelemetry(option =>
        {
            var applicationInsightOptions = applicationInsightsSection.Get<ApplicationInsightOptions>();
            if (applicationInsightOptions is not null)
            {
                option.ConnectionString = applicationInsightOptions.ConnectionString;
            }
        });
        return builder;
    }
}

public class ApplicationInsightOptions
{
    public const string ApplicationInsightsSectionName = "ApplicationInsights";

    public string ConnectionString { get; set; } = string.Empty;
}