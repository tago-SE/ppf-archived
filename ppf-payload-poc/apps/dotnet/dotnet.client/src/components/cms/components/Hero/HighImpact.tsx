import React from "react";

import type { Page } from "@ppf/payload-renderer/payload-types";
import { RichText } from "../RichText";
import { CMSLink } from "../CMSLink";
import { Media } from "../Media";

export const HighImpactHero: React.FC<Page["hero"]> = ({
  links,
  media,
  richText,
}) => {
  return (
    <div
      className="relative flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="absolute mb-8 z-10 flex items-center justify-center px-5">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && (
            <RichText className="mb-6" data={richText} enableGutter={false} />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.filter(x => !!x).map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="w-full h-[60vh] select-none flex items-stretch justify-stretch">
        {media && typeof media === "object" && (
          <Media
            fill
            imgClassName="object-cover w-full h-full"
            className="flex-1"
            priority={false}
            loading="lazy"
            resource={media}
          />
        )}
      </div>
    </div>
  );
};
