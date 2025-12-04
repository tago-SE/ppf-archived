import { PageQuery } from "../../../gql/generated";

export type ApplicationPageProps = { data?: NonNullable<NonNullable<PageQuery["PagesByTenant"]>["docs"]>[number] }

export const ApplicationPage: React.FC<ApplicationPageProps> = ({ data }) => {
    return (
        <div className="prose">
            <h1>{data?.title}</h1>
        </div>
    )
}

export default ApplicationPage;