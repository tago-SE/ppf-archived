import React from "react";

interface UnauthorizedPageProps {
  tenant?: string;
  slug?: string[];
}

export const UnauthorizedPage = (_: UnauthorizedPageProps) => {
  return (
    <React.Fragment>
      <h2>You are not authorized!</h2>
    </React.Fragment>
  );
};
