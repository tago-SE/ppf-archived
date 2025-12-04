import { PublicEnvScript, env as _ } from "next-runtime-env";

import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../env.mjs";

export async function GET(request: NextRequest, response: NextResponse) {
  const result = {
    KEY_VAULT_CLIENTID: env.KEY_VAULT_CLIENTID,
    KEY_VAULT_URL:  env.KEY_VAULT_URL,
    NEXT_PUBLIC_RUNTIME_TEST:  env.NEXT_PUBLIC_RUNTIME_TEST,
    P_NEXT_PUBLIC_RUNTIME_TEST: env.NEXT_PUBLIC_RUNTIME_TEST,
    process: process.env,
  };
  try {
    return new Response(
      JSON.stringify({
        config: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
