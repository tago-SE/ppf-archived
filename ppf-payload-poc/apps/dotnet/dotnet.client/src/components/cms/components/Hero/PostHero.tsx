import type { Page } from "@ppf/payload-renderer/payload-types";
import { Fragment } from "react/jsx-runtime";
import { Media } from "../Media";
import { formatDateTime } from "../../../../utils/formatDateTime";

export const PostHero: React.FC<{
  post: Page;
}> = ({ post }) => {
  const {
    categories,
    meta: { image: metaImage } = {},
    populatedAuthors,
    publishedAt,
    title,
  } = post;
  return (
    <div className="flex flex-col items-center gap-4 p-5 mb-10 bg-base-200">
      <div className="container max-w-[48rem]">
        <div className="uppercase text-sm mb-6">
          {categories?.map((category, index) => {
            if (typeof category === "object" && category !== null) {
              const { title: categoryTitle } = category;

              const titleToUse = categoryTitle || "Untitled category";

              const isLast = index === categories.length - 1;

              return (
                <Fragment key={index}>
                  {titleToUse}
                  {!isLast && <Fragment>, &nbsp;</Fragment>}
                </Fragment>
              );
            }
            return null;
          })}
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row gap-4 md:gap-16">
            <div className="flex flex-col gap-4">
              {populatedAuthors && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Author</p>
                  {populatedAuthors.map((author, index) => {
                    const { name } = author;

                    const isLast = index === populatedAuthors.length - 1;
                    const secondToLast = index === populatedAuthors.length - 2;

                    return (
                      <Fragment key={index}>
                        {name}
                        {secondToLast && populatedAuthors.length > 2 && (
                          <Fragment>, </Fragment>
                        )}
                        {secondToLast && populatedAuthors.length === 2 && (
                          <Fragment> </Fragment>
                        )}
                        {!isLast && populatedAuthors.length > 1 && (
                          <Fragment>and </Fragment>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              )}
            </div>
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Date Published</p>
                <time dateTime={publishedAt}>
                  {formatDateTime(publishedAt)}
                </time>
              </div>
            )}
          </div>
          <div className="mt-8">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>
        </div>
        <div className="select-none">
          {metaImage && typeof metaImage !== "string" && (
            <Media
              fill
              priority={false}
              loading="lazy"
              imgClassName="-z-10 object-cover"
              resource={metaImage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
