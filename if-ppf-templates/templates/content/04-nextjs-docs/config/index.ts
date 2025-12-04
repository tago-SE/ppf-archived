/**
 * TODO:
 * 1) Modify this to something better
 * 2) Consider validation at build and runtime
 */
export const config = {
  azureDevOps: {
    organizationUrl:
      process.env.AZ_DEVOPS_ORG_URL ?? "https://dev.azure.com/if-it",
    personalAccessToken: process.env.AZ_DEVOPS_TOKEN!,
  },
};
