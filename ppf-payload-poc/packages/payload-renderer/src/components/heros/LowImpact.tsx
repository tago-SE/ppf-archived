import type { Page } from "@payload-types";
import { useRender } from "../Context";

export const LowImpactHero: React.FC<Page["hero"]> = (props) => {
  const {
    Hero: { LowImpactHero },
  } = useRender();
  return <LowImpactHero {...props} />;
};
