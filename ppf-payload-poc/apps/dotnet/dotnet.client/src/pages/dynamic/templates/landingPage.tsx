import { Page } from "@ppf/payload-renderer/payload-types";
import { LandingPageQuery } from "../../../gql/generated";
import { RenderBlocks, RenderHero } from "@ppf/payload-renderer/components";

export type LandingPageProps = {
  data?: NonNullable<
    NonNullable<LandingPageQuery["LandingPagesByTenant"]>["docs"]
  >[number];
};

export const LandingPage: React.FC<LandingPageProps> = ({ data }) => {
  return (
    <>
      {data?.hero && data.hero.type != "none" ? (
        <RenderHero {...(data.hero as Page["hero"])} />
      ) : null}
      {data?.layout ? (
        <RenderBlocks blocks={data.layout as Page["layout"]} />
      ) : null}
    </>
  );
};

export default LandingPage;
