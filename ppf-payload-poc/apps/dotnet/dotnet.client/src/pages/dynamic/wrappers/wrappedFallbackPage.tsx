import FallbackPage, { FallbackPageProps } from "../templates/fallbackPage";
import { PageComponentWrapper } from "./types";

export const WrappedFallbackPage: PageComponentWrapper = ({ data }) => {
    return <FallbackPage data={data as FallbackPageProps["data"]} />;
};

export default WrappedFallbackPage;