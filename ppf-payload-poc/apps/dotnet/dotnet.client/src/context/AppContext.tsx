import { Tenant } from "@ppf/payload-renderer/payload-types";
import { createContext } from "react";
import { Sitemap } from "../types/sitemap";

type AppContextType = {
  tenant?: Tenant | undefined | null;
  sitemap?: Sitemap;
};

const AppContext = createContext<AppContextType>({
  tenant: undefined,
  sitemap: undefined,
});

export default AppContext;
