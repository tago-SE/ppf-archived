/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from "next";

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { GenerageMetaDataBaseArgs } from "../../../../GenerageMetaDataArgs";

import { importMap } from "../importMap";

export const generateMetadata = ({
  params,
  searchParams,
}: GenerageMetaDataBaseArgs): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: GenerageMetaDataBaseArgs) =>
  RootPage({ config, importMap, params, searchParams });

export default Page;
