import { PageQuery } from "../../../gql/generated";

export type ListPageProps = { data?: NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number] }

export const ListPage: React.FC<ListPageProps> = ({ data }) => {
    return (
        <div className="prose">
            <h1>{data?.title}</h1>
        </div>
    )
}

export default ListPage;