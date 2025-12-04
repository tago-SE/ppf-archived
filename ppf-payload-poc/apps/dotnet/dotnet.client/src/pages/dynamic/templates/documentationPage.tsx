import { DocumentationPageQuery } from "../../../gql/generated";
import { RenderBlocks } from "@ppf/payload-renderer";

export type DocumentationPageProps = { data?: NonNullable<NonNullable<DocumentationPageQuery["DocumentationPagesByTenant"]>["docs"]>[number] }

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ data }) => {
    return (
        <>
            {/*page?.hero && page.hero.type != "none" ? <RenderHero {...page.hero} /> : null*/}
            {data?.layout ? 
                <RenderBlocks
                    blocks={data.layout}
                />
            : null}
        </>
    )
}

export default DocumentationPage;