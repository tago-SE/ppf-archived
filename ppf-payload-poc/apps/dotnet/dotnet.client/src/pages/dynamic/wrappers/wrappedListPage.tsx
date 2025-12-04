import ListPage, { ListPageProps } from "../templates/listPage";
import { PageComponentWrapper } from "./types";

export const WrappedListPage: PageComponentWrapper = ({ data }) => {
    return <ListPage data={data as ListPageProps["data"]} />;
};

export default WrappedListPage;