// TODO: Move to more appropriate place
export type GenerageMetaDataBaseArgs = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};
