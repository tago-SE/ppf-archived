using WebPortal.Server.Configuration.AppInsights;

namespace WebPortal.Server.Configuration;

public class RootOptions
{
    public LoggingOptions Logging { get; set; }
    public string AllowedHosts { get; set; }
    public AppOptions Application { get; set; }
    public BuildOptions Build { get; set; }
    public RedisOptions Redis { get; set; }
    public ApplicationInsightsOptions AppInsights { get; set; }
}

public class LoggingOptions
{
    public LogLevelOptions LogLevel { get; set; }
}

public class LogLevelOptions
{
    public string Default { get; set; }
    public string MicrosoftAspNetCore { get; set; }
}