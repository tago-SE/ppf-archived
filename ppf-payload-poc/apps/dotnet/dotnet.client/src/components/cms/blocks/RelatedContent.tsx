import clsx from "clsx";
import React, { Fragment } from "react";
import type { Page } from "@ppf/payload-renderer/payload-types";
import { RichText } from "../components/RichText";
import { cn } from "../../../utils/cn";
import { CMSLink } from "../components/CMSLink";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type RelatedContentCardData = Pick<
  Page,
  "slug" | "categories" | "meta" | "title"
>;

function RelatedContentCard(props: {
  alignItems?: "center";
  className?: string;
  doc?: RelatedContentCardData;
  relationTo?: "article";
  showCategories?: boolean;
  title?: string;
}) {
  const {
    className,
    doc,
    relationTo,
    showCategories,
    title: titleFromProps,
  } = props;
  const { slug, categories, meta, title } = doc || {};
  const { description, /* image: metaImage */ } = meta || {};

  const hasCategories =
    categories && Array.isArray(categories) && categories.length > 0;
  const titleToUse = titleFromProps || title;
  const sanitizedDescription = description?.replace(/\s/g, " "); // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`;

  return (
    <article className={cn("card card-border", className)}>
      <div className="card-body">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === "object") {
                    const { title: titleFromCategory } = category;

                    const categoryTitle =
                      titleFromCategory || "Untitled category";

                    const isLast = index === categories.length - 1;

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose card-title">
            <CMSLink className="not-prose" url={href}>
              {titleToUse}
            </CMSLink>
          </div>
        )}
        {description && (
          <div className="mt-2">
            {description && <p>{sanitizedDescription}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

export type RelatedContentProps = {
  className?: string;
  docs?: Page[];
  introContent?: SerializedEditorState;
};

export const RelatedContent: React.FC<RelatedContentProps> = (props) => {
  const { className, docs, introContent } = props;

  return (
    <div className={clsx("lg:container", className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
        {docs?.map((doc, index) => {
          if (typeof doc === "string") return null;
          return (
            <RelatedContentCard
              key={index}
              doc={doc}
              relationTo="article"
              showCategories
            />
          );
        })}
      </div>
    </div>
  );
};
