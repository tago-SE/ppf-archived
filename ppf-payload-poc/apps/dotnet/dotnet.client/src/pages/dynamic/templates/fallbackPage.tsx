import { PageQuery } from "../../../gql/generated";

export type FallbackPageProps = { data?: NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number] }

export const FallbackPage: React.FC<FallbackPageProps> = ({ data }) => {
    return (
        <>
            <div className="px-5 py-5 prose">
                <h2 className="text-error">Error determining page type</h2>
                <h3 className="text-error">This is fallback page component</h3>
            </div>
            <div className="prose">
                <h1>{data?.title}</h1>
            </div>
        </>
    )
}

export default FallbackPage;