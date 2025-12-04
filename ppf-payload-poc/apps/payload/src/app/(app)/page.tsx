// import { headers as getHeaders } from "next/headers";
import Link from "next/link";
import React, { Fragment } from "react";

// import config from "../../payload.config";
// import { getPayloadWithConfig } from "@/lib/utils/getPayload";

export default async function HomePage() {
  // const headers = await getHeaders();
  // const payload = await getPayloadWithConfig();
  // const { permissions, user } = await payload.auth({ headers });
  const environment = process.env.DEPLOYED_ENV ?? "";
  return (
    <Fragment>
      <h1>Payload CMS POC {process.env.DEPLOYED_ENV}</h1>
      <p>
        <Link href={"/admin"}>login to the admin dashboard</Link>.
      </p>
    </Fragment>
  );
}
