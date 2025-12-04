import { Endpoint } from "payload";

export const getHealthcheckStatus: Endpoint = {
  path: "/ping",
  method: "get",
  handler: async (req) => {
    return Response.json(
      {
        message: "PONG", // Dummy healthcheck endpoint that can be extended in the future
      },
      { status: 200 }
    );
  },
};
