namespace dotnet.Server.Infrastructure.Authentication;

using Azure.Core;
using Azure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System;
using System.Reflection.Metadata;
using System.Threading;
using System.Threading.Tasks;

public class ApplicationIdentityOptions
{
    public const string SectionName = "Application:Identity";

    public string ClientId { get; set; } = "";
    public string TenantId { get; set; } = "";
    public string ClientSecret { get; set; } = "";
    public bool IsClientCredentialsFlow =>
        !string.IsNullOrEmpty(ClientId) &&
        !string.IsNullOrEmpty(TenantId) &&
        !string.IsNullOrEmpty(ClientSecret);
    public bool IsManagedIdentityFlow =>
        !string.IsNullOrEmpty(ClientId) &&
        string.IsNullOrEmpty(TenantId) &&
        string.IsNullOrEmpty(ClientSecret);
    public bool IsDefaultCredentialsFlow =>
        string.IsNullOrEmpty(ClientId);
}

public class TokenCredentialCached(TokenCredential innerCredential) : TokenCredential
{
    private readonly TokenCredential _innerCredential = innerCredential ?? throw new ArgumentNullException(nameof(innerCredential));
    private readonly TimeSpan _tokenExpiryBuffer = TimeSpan.FromMinutes(2);
    private readonly Dictionary<string, AccessToken> _cache = [];

    public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken)
    {
        var cacheKey = GenerateCacheKey(requestContext);
        if (_cache.TryGetValue(cacheKey, out var cachedToken) && cachedToken.ExpiresOn > DateTimeOffset.UtcNow.Add(_tokenExpiryBuffer))
        {
            return cachedToken;
        }
        var result = _innerCredential.GetToken(requestContext, cancellationToken);
        _cache[cacheKey] = result;
        return result;
    }

    public override async ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken)
    {
        var cacheKey = GenerateCacheKey(requestContext);
        if (_cache.TryGetValue(cacheKey, out var cachedToken) && cachedToken.ExpiresOn > DateTimeOffset.UtcNow.Add(_tokenExpiryBuffer))
        {
            return cachedToken;
 
        }
        var result = await _innerCredential.GetTokenAsync(requestContext, cancellationToken);
        _cache[cacheKey] = result;
        return result;
    }

    private static string GenerateCacheKey(TokenRequestContext requestContext)
    {
        var scopesKey = string.Join(" ", requestContext.Scopes);
        var claimsKey = requestContext.Claims ?? "";
        return $"{scopesKey}|{claimsKey}";
    }
}


public class ApplicationTokenCredentialFactory(IOptions<ApplicationIdentityOptions> identityOptions)
{
    private readonly ApplicationIdentityOptions _identityOptions = identityOptions.Value;

    private TokenCredential CreateCredential()
    {
        if (_identityOptions.IsManagedIdentityFlow)
        {
            return new ManagedIdentityCredential(clientId: _identityOptions.ClientId);
        }

        if (_identityOptions.IsClientCredentialsFlow)
        {
            return new ClientSecretCredential(
                _identityOptions.TenantId,
                _identityOptions.ClientId,
                _identityOptions.ClientSecret
            );
        }
        return new ChainedTokenCredential(
            new VisualStudioCodeCredential(),
            new DefaultAzureCredential()
        );
    }

    public TokenCredential GetCredential(bool useCache = false)
    {
        var credential = CreateCredential();
        return useCache ? new TokenCredentialCached(credential) : credential;
    }   
}