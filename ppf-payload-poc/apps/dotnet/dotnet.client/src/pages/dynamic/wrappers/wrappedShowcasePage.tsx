
import ShowcasePage, { ShowcasePageProps } from "../templates/showcasePage";
import { PageComponentWrapper } from "./types";

export const WrappedShowcasePage: PageComponentWrapper = ({ data }) => {
    return <ShowcasePage data={data as ShowcasePageProps["data"]} />;
};

export default WrappedShowcasePage;