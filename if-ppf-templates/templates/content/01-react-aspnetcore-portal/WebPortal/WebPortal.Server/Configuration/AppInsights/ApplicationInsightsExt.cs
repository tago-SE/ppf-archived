namespace WebPortal.Server.Configuration.AppInsights;

public static class ApplicationInsightsExt
{
    public static WebApplicationBuilder ConfigureApplicationInsights(this WebApplicationBuilder builder)
    {
        var applicationInsightsSection = builder.Configuration.GetSection(ApplicationInsightsOptions.ApplicationInsightsSectionName);
        builder.Services.Configure<ApplicationInsightsOptions>(applicationInsightsSection);
        builder.Services.AddApplicationInsightsTelemetry(option =>
        {
            var applicationInsightOptions = applicationInsightsSection.Get<ApplicationInsightsOptions>();
            option.ConnectionString = applicationInsightOptions!.ConnectionString;
        });
        return builder;
    }
}
