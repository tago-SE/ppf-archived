namespace dotnet.Server.Infrastructure.Config;

public class PayloadOptions
{
    public const string SectionName = "Payload";
    public string TenantSlug { get; set; } = "";
    public string AuthStrategy { get; set; } = "";
    public string Host { get; set; } = "";
}
