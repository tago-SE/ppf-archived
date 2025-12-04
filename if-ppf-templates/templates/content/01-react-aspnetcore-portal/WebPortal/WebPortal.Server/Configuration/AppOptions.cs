namespace WebPortal.Server.Configuration;

public class IdentityOptions
{
    public string ClientId { get; set; }
    public string ObjectId { get; set; }
}

public class AppOptions
{
    public const string ConfigSectionName = "Application";

    public IdentityOptions Identity { get; set; }
    public string Host { get; set; }
}