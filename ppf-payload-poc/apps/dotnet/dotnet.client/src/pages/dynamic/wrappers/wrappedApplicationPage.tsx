import ApplicationPage, { ApplicationPageProps } from "../templates/applicationPage";
import { PageComponentWrapper } from "./types";

export const WrappedApplicationPage: PageComponentWrapper = ({ data }) => {
    return <ApplicationPage data={data as ApplicationPageProps["data"]} />;
};

export default WrappedApplicationPage;