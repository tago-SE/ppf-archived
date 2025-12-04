import { PageQuery } from "../../../gql/generated";

export type LegalPageProps = { data?: NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number] }

export const LegalPage: React.FC<LegalPageProps> = ({ data }) => {
    return (
        <div className="prose">
            <h1>{data?.title}</h1>
        </div>
    )
}

export default LegalPage;