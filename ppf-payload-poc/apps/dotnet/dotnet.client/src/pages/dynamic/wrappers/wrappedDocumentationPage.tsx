import DocumentationPage, { DocumentationPageProps } from "../templates/documentationPage";
import { PageComponentWrapper } from "./types";

export const WrappedDocumentationPage: PageComponentWrapper = ({ data }) => {
    return <DocumentationPage data={data as DocumentationPageProps["data"]} />;
};

export default WrappedDocumentationPage;