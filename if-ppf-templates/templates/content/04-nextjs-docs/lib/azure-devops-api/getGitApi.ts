import {
  getPersonalAccessTokenHandler,
  WebApi,
} from "azure-devops-node-api/WebApi";
import { IGitApi } from "azure-devops-node-api/GitApi";

let gitApi: IGitApi = undefined!;

import { config } from "../../config";

export const getGitApi = async () => {
  if (!gitApi) {
    const authHandler = getPersonalAccessTokenHandler(
      config.azureDevOps.personalAccessToken
    );
    const connection = new WebApi(
      config.azureDevOps.organizationUrl,
      authHandler
    );
    gitApi = await connection.getGitApi();
  }
  return gitApi;
};
