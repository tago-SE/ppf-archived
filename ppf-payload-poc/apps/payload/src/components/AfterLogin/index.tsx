import { AuthProviderName } from "@/lib/auth/config";
import { signOut, signIn, auth } from "@/lib/auth";
import { Button } from "@payloadcms/ui";

function SignOut() {
  // We should remove this
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin", redirect: true });
      }}
    >
      <Button type="submit" className="absolute bottom-8 left-8 cursor-pointer">
        Sign out If
      </Button>
    </form>
  );
}

function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 mt-8 mb-24 w-full">
      <form
        key={AuthProviderName.AzureAd}
        action={async () => {
          "use server";
          await signIn(AuthProviderName.AzureAd);
        }}
      >
        <Button type="submit" className="w-full cursor-pointer p-8">
          Sign in with If Account
        </Button>
      </form>
    </div>
  );
}

export const OAuthLoginButton = async () => {
  // TODO: Needs because this is currently always SignIn and only visible in /admin/login page
  const session = await auth();
  return <>{session?.user ? <SignOut /> : <SignIn />}</>;
};
