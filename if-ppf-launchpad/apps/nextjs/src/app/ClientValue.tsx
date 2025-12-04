"use client";

import { env } from "../env.mjs";

export default function EnvVariableTest() {
  return (
    <>
      <p>Here</p>
      {/* <p>{env.KEY_VAULT_CLIENTID}</p> */}
      <p>{env.NEXT_PUBLIC_RUNTIME_TEST}</p>
    </>
  );
}
