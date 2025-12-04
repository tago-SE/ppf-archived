namespace WebPortal.Server.Configuration.AppInsights;

public class ApplicationInsightsOptions
{
    public const string ApplicationInsightsSectionName = "ApplicationInsights";

    public string ConnectionString { get; set; } = string.Empty;
}
