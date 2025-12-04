export enum DeployEnv {
  Dev = "dev",
  Test = "test",
  Prod = "prod",
  LocalOrUnknown = "localOrUnknown",
}

function getCurrentDeployedEnvironment() {
  const env = process.env.DEPLOYED_ENV;
  if (
    env === DeployEnv.Dev ||
    env === DeployEnv.Test ||
    env === DeployEnv.Prod
  ) {
    return env;
  }
  return DeployEnv.LocalOrUnknown;
}

const deployedEnvironment = getCurrentDeployedEnvironment();

const allEnvironments = [
  DeployEnv.LocalOrUnknown,
  DeployEnv.Dev,
  DeployEnv.Test,
  DeployEnv.Prod,
];

export const deployEnvConfig = {
  currentEnv: deployedEnvironment,
  allEnvironmentsButProd: allEnvironments.filter((x) => x != DeployEnv.Prod),
  allEnvironments: allEnvironments,
};


export function getCurrentDeployedEnvironmentThrows() {
  const env = process.env.DEPLOYED_ENV;
  if (
    env === DeployEnv.Dev ||
    env === DeployEnv.Test ||
    env === DeployEnv.Prod
  ) {
    return env;
  }
  throw new Error("Missing env.DEPLOYED_ENV");
}
