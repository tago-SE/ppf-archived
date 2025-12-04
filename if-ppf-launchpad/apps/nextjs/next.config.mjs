/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        instrumentationHook: true,
    },

    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.resolve = {
            ...config.resolve,
            fallback: {
                // Developer Note:
                // This fallback configuration is a temporary fix to silence module resolution errors caused by 
                // applicationinsights, which includes unnecessary external dependencies such as 
                // @opentelemetry/instrumentation, @azure/functions-core, and @opentelemetry/exporter-jaeger.
                //
                // The current solution prevents these modules from being bundled by setting them to `false`.
                // 
                // Ideally, this should be removed once the issue is patched upstream in the respective dependencies.
                // 
                // If you find a better approach to suppress these warnings or if the dependencies are no longer required, 
                // please update this configuration and reach out to the maintainers of this template.
                '../../../@opentelemetry/instrumentation': false,
                '@azure/functions-core': false,
                '@opentelemetry/exporter-jaeger': false,
            },
        };
        return config
    },
};

export default nextConfig;
