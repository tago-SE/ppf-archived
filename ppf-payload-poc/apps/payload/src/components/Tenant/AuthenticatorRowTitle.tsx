"use client";

import type { Data } from "payload";
import { useRowLabel } from "@payloadcms/ui";
import { tenantAuthOptions } from "@/collections/Tenants/fields/authentication/authenticationOptions";

interface ArrayFieldTitleProps {
  fieldPath: (string | number)[];
}

const getValueAtPath = (obj: any, path: (string | number)[]) => {
  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );
};

const { servicePrincipal, group, curityClient } = tenantAuthOptions;

function TenantAuthenticatorFieldTitle({ fieldPath }: ArrayFieldTitleProps) {
  const { data, rowNumber } = useRowLabel<Data>();
  const principalType = getValueAtPath(data, fieldPath) as string;
  const principal = getValueAtPath(data, fieldPath.slice(0, -1));
  if (principalType === group.value) {
    return (
      "[" +
      rowNumber +
      "] " +
      (principal[group.value]?.name
        ? principal[group.value]?.name
        : group.label + " " + principal[group.value]?.objectId)
    );
  }
  if (principalType === servicePrincipal.value) {
    return (
      "[" +
      rowNumber +
      "] " +
      servicePrincipal.label +
      " " +
      principal[servicePrincipal.value]?.objectId
    );
  }
  if (principalType === curityClient.value) {
    return (
      "[" +
      rowNumber +
      "] " +
      curityClient.label +
      " " +
      principal[curityClient.value]?.clientId
    );
  }
  return null;
}

export default TenantAuthenticatorFieldTitle;
