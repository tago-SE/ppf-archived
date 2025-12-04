import ArticlePage, { ArticlePageProps } from "../templates/articlePage";
import { PageComponentWrapper } from "./types";

export const WrappedArticlePage: PageComponentWrapper = ({ data }) => {
    return <ArticlePage data={data as ArticlePageProps["data"]} />;
};

export default WrappedArticlePage;