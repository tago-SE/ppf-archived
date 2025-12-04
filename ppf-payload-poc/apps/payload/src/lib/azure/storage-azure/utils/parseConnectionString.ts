/**
 * Parse storage account connection string.
 * 
 * @param connectionString
 * @returns
 */
export function parseConnectionString(connectionString: string) {
  let account = "";
  let key = "";
  let defaultEndpointProtocol = "https";
  let endpointSuffix = "core.windows.net";

  const params = connectionString!.split(";");
  for (let param of params) {
    if (param.startsWith("endpointSuffix=")) {
      endpointSuffix = param.split("=")[1];
    }
    if (param.startsWith("DefaultEndpointsProtocol=")) {
      defaultEndpointProtocol = param.split("=")[1];
    }
    if (param.startsWith("AccountName=")) {
      account = param.split("=")[1];
    } else if (param.startsWith("AccountKey=")) {
      key = param.split("=")[1];
    }
  }
  const primaryEndpoints = {
    dfs: `${defaultEndpointProtocol}://${account}.dfs.${endpointSuffix}/`,
    web: `${defaultEndpointProtocol}://${account}.z6.web.${endpointSuffix}/`,
    blob: `${defaultEndpointProtocol}://${account}.blob.${endpointSuffix}/`,
    queue: `${defaultEndpointProtocol}://${account}.queue.${endpointSuffix}/`,
    table: `${defaultEndpointProtocol}://${account}.table.${endpointSuffix}/`,
    file: `${defaultEndpointProtocol}://${account}.file.${endpointSuffix}/`,
  };
  const secondaryEndpoints = {
    dfs: `${defaultEndpointProtocol}://${account}-secondary.dfs.${endpointSuffix}/`,
    web: `${defaultEndpointProtocol}://${account}-secondary.z6.web.${endpointSuffix}/`,
    blob: `${defaultEndpointProtocol}://${account}-secondary.blob.${endpointSuffix}/`,
    queue: `${defaultEndpointProtocol}://${account}-secondary.queue.${endpointSuffix}/`,
    table: `${defaultEndpointProtocol}://${account}-secondary.table.${endpointSuffix}/`,
    file: `${defaultEndpointProtocol}://${account}-secondary.file.${endpointSuffix}/`,
  };
  return {
    account,
    key,
    services: {
      dfs: {
        primary: new URL(primaryEndpoints.dfs),
        secondary: new URL(secondaryEndpoints.dfs),
      },
      web: {
        primary: new URL(primaryEndpoints.web),
        secondary: new URL(secondaryEndpoints.web),
      },
      blob: {
        primary: new URL(primaryEndpoints.blob),
        secondary: new URL(secondaryEndpoints.blob),
      },
      queue: {
        primary: new URL(primaryEndpoints.queue),
        secondary: new URL(secondaryEndpoints.queue),
      },
      table: {
        primary: new URL(primaryEndpoints.table),
        secondary: new URL(secondaryEndpoints.table),
      },
      file: {
        primary: new URL(primaryEndpoints.file),
        secondary: new URL(secondaryEndpoints.file),
      },
    },
  };
}
