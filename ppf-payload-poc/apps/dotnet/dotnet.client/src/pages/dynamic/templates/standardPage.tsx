import { Page } from "@ppf/payload-renderer/payload-types";
import { StandardPageQuery } from "../../../gql/generated";
import { RenderBlocks, RenderHero } from "@ppf/payload-renderer/components";

export type StandardPageProps = {
  data?: NonNullable<
    NonNullable<StandardPageQuery["StandardPagesByTenant"]>["docs"]
  >[number];
};

export const StandardPage: React.FC<StandardPageProps> = ({ data }) => {
  return (
    <>
      {data?.hero && data.hero.type != "none" ? (
        <RenderHero {...(data.hero as Page["hero"])} />
      ) : null}
      {data?.layout ? <RenderBlocks blocks={data.layout} /> : null}
    </>
  );
};

export default StandardPage;
