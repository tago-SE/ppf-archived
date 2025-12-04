import ProductPage, { ProductPageProps } from "../templates/productPage";
import { PageComponentWrapper } from "./types";

export const WrappedProductPage: PageComponentWrapper = ({ data }) => {
    return <ProductPage data={data as ProductPageProps["data"]} />;
};

export default WrappedProductPage;