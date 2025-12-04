import { ProductPageQuery } from "../../../gql/generated";
import { RenderBlocks } from "@ppf/payload-renderer";

export type ProductPageProps = { data?: NonNullable<NonNullable<ProductPageQuery["ProductPagesByTenant"]>["docs"]>[number] }

export const ProductPage: React.FC<ProductPageProps> = ({ data }) => {
    
    return (
        <>
            {data?.layout ? 
                <RenderBlocks
                    blocks={data.layout}
                />
            : null}
        </>
    )
}

export default ProductPage;