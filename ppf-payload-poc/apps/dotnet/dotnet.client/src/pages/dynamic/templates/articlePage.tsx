import { ArticlePageQuery } from "../../../gql/generated";
import { RenderBlocks } from "@ppf/payload-renderer";
import { Page } from "@ppf/payload-renderer/payload-types";
import { PostHero } from "../../../components/cms/components/Hero/PostHero";
import { RelatedContent } from "../../../components/cms/blocks/RelatedContent";

export type ArticlePageProps = {
  data?: NonNullable<
    NonNullable<ArticlePageQuery["ArticlePagesByTenant"]>["docs"]
  >[number];
};

export const ArticlePage: React.FC<ArticlePageProps> = ({ data }) => {
  return (
    <article className="pt-16 pb-16 px-5">
      {data ? (
        <>
          <PostHero post={data as Page} />
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container">
              {data?.layout ? (
                <div className="max-w-[48rem] mx-auto">
                  <RenderBlocks blocks={data.layout} />
                </div>
              ) : null}
              {data.related &&
                data.related.relatedContent &&
                data.related.relatedContent.length > 0 && (
                  <>
                    <div className="prose mt-24">
                      <h2>
                        {data.related.heading ?? "You migh also be interested"}
                      </h2>
                    </div>
                    <RelatedContent
                      className="mt-8 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                      docs={
                        data.related.relatedContent.filter(
                          (post) => typeof post === "object"
                        ) as Page[]
                      }
                    />
                  </>
                )}
            </div>
          </div>
        </>
      ) : null}
    </article>
  );
};

export default ArticlePage;
