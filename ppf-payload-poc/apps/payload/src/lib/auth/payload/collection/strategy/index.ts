import { IncomingAuthType } from "payload";
import { TOKEN_VALID_TIME_SECONDS } from "../../../config";
import { curityClientCredentialsStrategy } from "./CurityClientCredentialsStrategy.ts";
import { externalEntraUserStrategy } from "./ExternalEntraUserStrategy.ts";
import { authjsSessionStrategy } from "./SessionAuthStrategy.ts";
import { externalEntraServiceStrategy } from "./ExternalEntraServicePrincipalStrategy.ts";
import { handleUnresolvedUser } from "./utils/handlers.ts";
import { ifApiPlatformStrategy } from "./if-api-platform/IfApiPlatformStrategy.ts";

const strategyName = "payload-auth";

export const x_auth_method = "x-ppf-auth-method";
const x_auth_method_options = x_auth_method + "-options";
const x_auth_method_info = x_auth_method + "-info";

export const authStrategies = [
  externalEntraUserStrategy,
  externalEntraServiceStrategy,
  curityClientCredentialsStrategy,
  ifApiPlatformStrategy,
];

const validAuthStrategyNames = authStrategies
  .map((strategy) => strategy.name)
  .join(", ");

export const collectionAuthConfig: IncomingAuthType = {
  tokenExpiration: TOKEN_VALID_TIME_SECONDS,
  disableLocalStrategy: true,
  removeTokenFromResponses: true,
  loginWithUsername: false,
  strategies: [
    {
      name: strategyName,
      authenticate: async (args) => {
        const { headers, payload, isGraphQL: _ } = args;
        if (headers.has(x_auth_method)) {
          const headerAuthStrategy = headers.get(x_auth_method);
          const strategy = authStrategies.find(
            (strategy) =>
              !!strategy.name && strategy.name === headerAuthStrategy
          );
          if (!!strategy) {
            return await strategy.authenticate({
              ...args,
              strategyName: strategy.name,
            });
          }
          const responseHeaders = new Headers();
          new Headers({
            [x_auth_method_options]: validAuthStrategyNames,
            [x_auth_method_info]: `Please include the "${x_auth_method}" header with one of the available strategies.`,
          });
          return handleUnresolvedUser({
            payload,
            responseHeaders,
            strategyName: strategyName,
            logMessage: `Invalid ${x_auth_method}='${headerAuthStrategy}'. Expected OneOf: ${validAuthStrategyNames}`,
          });
        }
        // if (!headers.has("Cookie")) {
        //   const responseHeaders = new Headers();
        //   responseHeaders.set(x_auth_method_options, validStrategyNames);
        //   responseHeaders.set(
        //     x_auth_method_info,
        //     `Please include the "${x_auth_method}" header with one of the available strategies, or provide the "Cookie" header for session-based authentication.`
        //   );
        //   return handleUnresolvedUser({
        //     payload,
        //     responseHeaders,
        //     strategyName: strategyName,
        //     logMessage:
        //       "Missing Cookie header. Please provide a valid authentication header or Cookie for session-based auth.",
        //   });
        // }
        // Note: THERE MAY BE SOMETHING INSIDE OF HERE WHICH CAUSES PROBLEMS WITH RESPONSE HEADERS NEED TO CHECK...
        return await authjsSessionStrategy.authenticate({
          ...args,
          strategyName: authjsSessionStrategy.name,
        });
      },
    },
  ],
};
