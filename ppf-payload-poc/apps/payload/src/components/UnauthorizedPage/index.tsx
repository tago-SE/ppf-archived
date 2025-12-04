import type { Page } from "@payload-types";

import React from "react";

interface UnauthorizedPageProps {
  data?: any;
}

export const UnauthorizedPage = ({ data }: UnauthorizedPageProps) => {
  return (
    <React.Fragment>
      <h2>You are not authorized!</h2>
      <code>{JSON.stringify(data ?? {})}</code>
    </React.Fragment>
  );
};
