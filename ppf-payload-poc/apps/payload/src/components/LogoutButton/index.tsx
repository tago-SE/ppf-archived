import React from "react";
import { Button as PayloadButton } from "@payloadcms/ui";
// import { signOutAction } from "./signOutAction";
import LogoutClient from "./client";

/**
 * Logout Button which is used in the side-panel
 */
export const LogoutButton = () => {
  return <LogoutClient />;
  // return (
  //   <form
  //     action={async () => {
  //       "use server";
  //       await signOutAction();
  //     }}
  //   >
  //     <PayloadButton
  //       type="submit"
  //       className="absolute bottom-8 left-8 cursor-pointer"
  //     >
  //       Sign out If
  //     </PayloadButton>
  //   </form>
  // );
};

export default LogoutButton;

/*
"use server";

import { signOut, auth } from "@/lib/auth";
import { revokeUserSession } from "@/lib/auth/revokeUserSession";

export async function signOutAction() {
  // Step 1 - ensure the user token are revoked
  const session = await auth();
  if (Boolean(session)) {
    await revokeUserSession({
      userId: session?.user?.id,
      clearSessions: false, // Not sure if we should delete the sessions here or let that be managed internally
    });
  }
  // Step 2 - continue signout with framework
  await signOut({ redirectTo: "/admin", redirect: true });
}

*/