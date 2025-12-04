import { redirect } from "next/navigation";
import type { User } from "../../payload-types";
import { cookies } from "next/headers";

async function getPayloadToken() {
  const cookieStore = await cookies();
  return cookieStore.get("payload-token")?.value;
}


export type GetMeUserData = {
  user: User | undefined;
  success: boolean;
  token?: string;
};

async function getMeUserRequest(): Promise<GetMeUserData> {
  const token = await getPayloadToken();
  const meUserReq = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
  });
  if (!meUserReq.ok) {
    return { user: undefined, success: false };
  }
  const {
    user,
  }: {
    user: User;
  } = await meUserReq.json();

  return { user, success: meUserReq.ok, token };
}

export async function userWithRedirect(args?: {
  /**
   * Redirects if the user is not signed in.
   */
  nullUserRedirect?: string;
  /**
   * Redirect if the user is signed in.
   */
  validUserRedirect?: string;
}): Promise<{ user: User | undefined; token?: string }> {
  const { nullUserRedirect, validUserRedirect } = args || {};
  const { user, success, token } = await getMeUserRequest();
  if (validUserRedirect && success && user) {
    redirect(validUserRedirect);
  }
  if (nullUserRedirect && (!success || !user)) {
    redirect(nullUserRedirect);
  }
  return { user, token };
}
