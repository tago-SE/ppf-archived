import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AppAuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider refetchInterval={240}>{children}</SessionProvider>;
}

export default AppAuthProvider;
