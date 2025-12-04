import LegalPage, { LegalPageProps } from "../templates/legalPage";
import { PageComponentWrapper } from "./types";

export const WrappedLegalPage: PageComponentWrapper = ({ data }) => {
    return <LegalPage data={data as LegalPageProps["data"]} />;
};

export default WrappedLegalPage;