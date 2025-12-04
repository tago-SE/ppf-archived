import type { Page } from "@payload-types";
import { useRender } from "../Context";

export const HighImpactHero: React.FC<Page["hero"]> = (props) => {
  const {
    Hero: { HighImpactHero },
  } = useRender();
  return <HighImpactHero {...props} />;
};
