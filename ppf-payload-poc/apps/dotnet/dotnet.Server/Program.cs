using Azure.Core;
using dotnet.Server.Infrastructure.Appinsights;
using dotnet.Server.Infrastructure.Authentication;
using dotnet.Server.Infrastructure.Config;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using dotnet.Server.Infrastructure.Configuration;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<ApplicationIdentityOptions>(builder.Configuration.GetSection(ApplicationIdentityOptions.SectionName));
builder.Services.Configure<PayloadOptions>(builder.Configuration.GetSection(PayloadOptions.SectionName));

builder.Services.AddSingleton<ApplicationTokenCredentialFactory>();
builder.Services.AddSingleton(provider =>
{
    var factory = provider.GetRequiredService<ApplicationTokenCredentialFactory>();
    return factory.GetCredential(useCache: false);
});

builder.ConfigureApplicationInsights();
builder.ConfigureCompression();
builder.Services.AddControllers();
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy")).AddTransforms(builderContext =>
    {
        builderContext.AddRequestTransform(async transformContext =>
        {
            var serviceProvider = transformContext.HttpContext.RequestServices;

            var tokenCredential = serviceProvider.GetRequiredService<TokenCredential>();
            var token = await tokenCredential.GetTokenAsync(new TokenRequestContext(scopes: ["https://management.azure.com/.default"]), transformContext.HttpContext.RequestAborted);
            transformContext.ProxyRequest.Headers.Authorization = new AuthenticationHeaderValue(token.TokenType, token.Token);
            var jwtHandler = new JwtSecurityTokenHandler();
            var jwtToken = jwtHandler.ReadJwtToken(token.Token);
            var cmsOptions = serviceProvider.GetRequiredService<IOptions<PayloadOptions>>().Value;
            transformContext.ProxyRequest.Headers.Add("x-ppf-auth-method", string.IsNullOrEmpty(cmsOptions.AuthStrategy) ? "ext-entra-service" : cmsOptions.AuthStrategy);
            transformContext.ProxyRequest.Headers.Add("x-ppf-tenant-slug", cmsOptions.TenantSlug);
        });
        builderContext.AddResponseTransform(async transformContext =>
        {
            // TODO: should do logging here? If API responds with 500 should we generate our own correlationId/traceId for error sand replace in JSON?
        });
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseDefaultFiles();
app.UseResponseCompression(); // needs to be before static files
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.MapReverseProxy();

app.Run();
