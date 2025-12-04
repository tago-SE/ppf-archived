import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { registerOTel } from "@vercel/otel";
import { COLLECTION_SLUG_SESSIONS } from "./collections/config.ts";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    async function registerAppInsights() {
      let traceExporter: SpanExporter | undefined;

      const connectionString =
        process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
      if (!connectionString) {
        return;
      }
      // Went with this approach over the appinsights client due to webpack errors not sure if it is better or not...
      // https://maxwellweru.com/blog/2024/03/nextjs-opentelemetry-with-azure-monitor
      const { AzureMonitorTraceExporter } = await import(
        "@azure/monitor-opentelemetry-exporter"
      );
      /*
      // This is the approach that was complaining when running in dev
    
      if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
        const appInsights = await import('applicationinsights');
        appInsights
          .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
          .setAutoCollectConsole(true, true)
          .setAutoDependencyCorrelation(true)
          .enableWebInstrumentation(true)
          .setSendLiveMetrics()
          .start()
      }
      */
      traceExporter = new AzureMonitorTraceExporter({
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      });

      registerOTel({ serviceName: "payload-app", traceExporter });
    }

    async function registerJobsRunner() {
      const cron = await import("node-cron");
      const payload = await import("payload");
      const config = await import("./payload.config.ts");
      const { SESSION_MAX_AGE_SECONDS } = await import(
        "./lib/auth/config/index.ts"
      );
      const instance = await payload.getPayload({ config: config.default });

      // Run scheduled Payload jobs
      cron.schedule("*/1 * * * *", async () => {
        try {
          // NOTE: commented out because no jobs defined at moment and that spams console.log with warnings
          //await instance.jobs.run();
        } catch (e) {
          console.error(e);
        }
      });

      // Task to clear expired sessions (once per day at midnight)
      cron.schedule("0 0 * * *", async () => {
        try {
          // Selects expired sessions (1000 at the time)
          const currentDate = new Date();
          const dateThreshold = new Date(
            currentDate.getTime() - SESSION_MAX_AGE_SECONDS * 1000
          ).toISOString();

          const sessionsToDelete = await instance.find({
            collection: COLLECTION_SLUG_SESSIONS,
            where: {
              expires: {
                less_than: dateThreshold,
              },
            },
            select: {
              expires: true,
            },
            limit: 1000,
          });

          // Delete expired sessions
          const sessionsDeleted = await instance.delete({
            collection: COLLECTION_SLUG_SESSIONS,
            where: {
              id: {
                in: sessionsToDelete.docs.map((x) => x.id),
              },
            },
          });

          console.log(
            "Deleted " + sessionsDeleted.docs.length + " expired sessions"
          );
        } catch (e) {
          console.error(e);
        }
      });
    }

    async function registerNode() {
      await Promise.all([registerAppInsights(), registerJobsRunner()]);
    }

    await registerNode();
  }
}
