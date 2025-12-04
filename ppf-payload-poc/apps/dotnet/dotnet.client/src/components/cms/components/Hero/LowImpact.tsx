import type { Page } from "@ppf/payload-renderer/payload-types";
import { RichText } from "../RichText";

type LowImpactHeroType =
  | {
      children?: React.ReactNode;
      richText?: never;
    }
  | (Omit<Page["hero"], "richText"> & {
      children?: never;
      richText?: Page["hero"]["richText"];
    });

export const LowImpactHero: React.FC<LowImpactHeroType> = ({
  children,
  richText,
}) => {
  return (
    <div className="py-16 px-5 bg-base-200">
      <div className="max-w-[48rem]">
        {children ||
          (richText && <RichText data={richText} enableGutter={false} />)}
      </div>
    </div>
  );
};
