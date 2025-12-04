import type { BannerBlock as BannerBlockProps } from "@ppf/payload-renderer/payload-types";

import React from "react";
import { RichText } from "../RichText";
import { cn } from "../../../../utils/cn";

type Props = {
  className?: string;
} & BannerBlockProps;

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <div
      className={cn(
        "alert",
        {
          "alert-info": style === "info",
          "alert-error": style === "error",
          "alert-success": style === "success",
          "alert-warning": style === "warning",
        },
        className
      )}
    >
      <span
        className={cn("w-8 h-8", {
          "icon-[material-symbols-light--info-outline]": style === "info",
          "icon-[material-symbols-light--cancel-outline]": style === "error",
          "icon-[material-symbols-light--check-circle-outline]":
            style === "success",
          "icon-[material-symbols-light--warning-outline]": style === "warning",
        })}
      ></span>
      <span>
        <RichText data={content} enableGutter={false} enableProse={false} />
      </span>
    </div>
  );
};
