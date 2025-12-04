import LandingPage, { LandingPageProps } from "../templates/landingPage";
import { PageComponentWrapper } from "./types";

export const WrappedLandingPage: PageComponentWrapper = ({ data }) => {
    return <LandingPage data={data as LandingPageProps["data"]} />;
};

export default WrappedLandingPage;