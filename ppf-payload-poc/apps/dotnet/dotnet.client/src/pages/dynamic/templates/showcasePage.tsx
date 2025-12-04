import { PageQuery } from "../../../gql/generated";

export type ShowcasePageProps = { data?: NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number] }

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ data }) => {
    return (
        <div className="prose">
            <h1>{data?.title}</h1>
        </div>
    )
}

export default ShowcasePage;