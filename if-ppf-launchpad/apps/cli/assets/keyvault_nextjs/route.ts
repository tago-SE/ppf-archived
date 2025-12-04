import { NextRequest, NextResponse } from "next/server";
import { secretClient } from "@/lib/keyvault";

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    // Get secret value
    // const secretName = "supersecret";
    // const secret = await secretClient.getSecret(secretName);

    // Optional: Fetch a list of all secrets in the Key Vault
    const secretsList = [];
    for await (const secretProperties of secretClient.listPropertiesOfSecrets()) {
      secretsList.push(secretProperties);
    }

    // Optional: Health check for Key Vault access
    const keyVaultHealth = {
      status: "healthy",
      message: "Successfully accessed Key Vault",
    };

    return new Response(
      JSON.stringify({
        secretsList,
        keyVaultHealth,
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
