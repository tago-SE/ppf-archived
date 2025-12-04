"use client";

import type { Data } from "payload";
import { useRowLabel } from "@payloadcms/ui";
import React from "react";

interface ArrayFieldTitleProps {
  /**
   * The name of the field to be used to derive the name, will fallback to displayName, title or name.
   * @deprecated
   */
  fieldName?: string;

  fieldPath?: (string | number)[];
  showIndex?: boolean;
}

const getValueAtPath = (obj: any, path: (string | number)[]) => {
  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );
};

function ArrayFieldTitle({
  fieldName,
  fieldPath,
  showIndex,
}: ArrayFieldTitleProps) {
  const { data, rowNumber } = useRowLabel<Data>();
  const title = React.useMemo(() => {
    let value = "";
    if (fieldPath) {
      value = getValueAtPath(data, fieldPath);
    } else if (fieldName && data[fieldName]) {
      value = data[fieldName];
    }
    if (!!value && !!showIndex) {
      return `[${rowNumber}] ${value}`;
    }
    return value;
  }, [showIndex, rowNumber, data, fieldPath, fieldName]);

  return <span>{title}</span>;
}

export default ArrayFieldTitle;
