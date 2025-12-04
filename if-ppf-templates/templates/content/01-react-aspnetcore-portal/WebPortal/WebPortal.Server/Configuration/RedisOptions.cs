namespace WebPortal.Server.Configuration;

public class RedisOptions
{
    public const string ConfigSectionName = "Redis";
    public string UserName { get; set; }
    public string HostName { get; set; }
    public string KeyPrefix { get; set; }
    public string Port { get; set; }
}


