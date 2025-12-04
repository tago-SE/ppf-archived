import StandardPage, { StandardPageProps } from "../templates/standardPage";
import { PageComponentWrapper } from "./types";

export const WrappedStandardPage: PageComponentWrapper = ({ data }) => {
    return <StandardPage data={data as StandardPageProps["data"]} />;
};

export default WrappedStandardPage;