using WebPortal.Server.Configuration;
using WebPortal.Server.Integrations.MsGraph;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// Move to specific configu location 
builder.Services.Configure<RedisOptions>(builder.Configuration.GetSection(RedisOptions.ConfigSectionName));
builder.Services.Configure<AppOptions>(builder.Configuration.GetSection(AppOptions.ConfigSectionName));

builder.Services.AddMsGraphClient(builder.Environment.IsProduction());

builder.Services.AddHttpClient();
// 

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
