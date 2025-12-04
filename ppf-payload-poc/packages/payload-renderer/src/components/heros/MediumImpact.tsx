import type { Page } from "@payload-types";
import { useRender } from "../Context";

export const MediumImpactHero: React.FC<Page["hero"]> = (props) => {
  const {
    Hero: { MediumImpactHero },
  } = useRender();
  return <MediumImpactHero {...props} />;
};
