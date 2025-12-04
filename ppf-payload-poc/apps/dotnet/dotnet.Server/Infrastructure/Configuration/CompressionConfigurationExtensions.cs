using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

namespace dotnet.Server.Infrastructure.Configuration
{

    public static class CompressionConfigurationExtensions
    {
        public static WebApplicationBuilder ConfigureCompression(this WebApplicationBuilder builder)
        {
            builder.Services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
            });

            builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest;
            });

            builder.Services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.SmallestSize;
            });

            return builder;
        }
    }
}
