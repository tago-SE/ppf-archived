import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { CMSLink } from "../components/CMSLink";
import type { ContentBlock as ContentBlockProps } from "@ppf/payload-renderer/payload-types";
import type { CMSLinkType } from "@ppf/payload-renderer/components";
import { RichText } from "../components/RichText";
import { cn } from "../../../utils/cn";

const colsSpanClasses = {
  full: "12",
  half: "6",
  oneThird: "4",
  twoThirds: "8",
};

export const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => {
  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col) => {
            const { id, enableLink, richText, link, size } = col;

            return (
              <div
                key={id}
                className={cn(
                  `col-span-4 lg:col-span-${colsSpanClasses[size!]}`,
                  {
                    "md:col-span-2": size !== "full",
                  }
                )}
              >
                <RichText
                  data={richText as SerializedEditorState}
                  enableGutter={false}
                />
                {enableLink && link && (
                  <CMSLink {...(link as CMSLinkType)} className="mt-4" />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
