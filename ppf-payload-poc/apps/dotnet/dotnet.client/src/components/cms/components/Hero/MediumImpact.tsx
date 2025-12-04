import type { Page } from "@ppf/payload-renderer/payload-types";
import { RichText } from "../RichText";
import { CMSLink } from "../CMSLink";
import { Media } from "../Media";

export const MediumImpactHero: React.FC<Page["hero"]> = ({
  links,
  media,
  richText,
}) => {
  return (
    <div className="flex flex-row bg-base-200 flex-wrap">
      <div className="pt-16 px-5 mb-8 flex-1">
        {richText && (
          <RichText className="mb-6" data={richText} enableGutter={false} />
        )}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="px-5 flex-1">
        {media && typeof media === "object" && (
          <div className="h-full max-h-96">
            <Media
              className="h-full"
              imgClassName="w-full h-full object-cover"
              priority={false}
              loading="lazy"
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
