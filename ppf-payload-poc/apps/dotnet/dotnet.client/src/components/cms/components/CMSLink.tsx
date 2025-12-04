import { Link } from "@tanstack/react-router";
import { cva } from "class-variance-authority";
import { cn } from "../../../utils/cn";
import { CMSLinkType, useRender } from "@ppf/payload-renderer";
import { Page } from "@ppf/payload-renderer/payload-types";
import { getPreview } from "../../../utils/preview";
import { getPageMeta } from "../../../hooks/usePageTemplate";
import { pathToPageTypeMap } from "../../../../const";
import { useAppContext } from "../../../hooks/useAppContext";

const linkButtonVariants = cva("btn", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "btn-md",
      md: "btn-md",
      lg: "btn-lg",
      sm: "btn-sm",
    },
    variant: {
      default: "btn-primary",
      destructive: "btn-error",
      ghost: "btn-ghost",
      link: "btn-link",
      outline: "btn-outline",
      secondary: "bg-secondary",
    },
  },
});

export const CMSLink: React.FC<CMSLinkType & { onClick?: () => void }> = (
  props
) => {
  const { sitemap } = useAppContext();
  const { linkConfig } = useRender();
  const {
    type,
    appearance = "inline",
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    onClick,
  } = props;

  let href = url;
  if (
    type === "reference" &&
    reference?.relationTo === "pages" &&
    typeof reference?.value === "object"
  ) {
    const preview = getPreview();
    const pageTemplate = (reference.value as Page)?.pageTemplate;
    const path = pageTemplate
      ? linkConfig?.pathToPageTemplateMap?.[pageTemplate]
      : "";

    const pageMeta = getPageMeta(reference.value.id, sitemap);
    const pageType = path || (pageMeta && pageMeta.pageTemplate ? pathToPageTypeMap[pageMeta.pageTemplate] : undefined);

    href =
      reference.value?.slug === "home"
        ? "/"
        : `/${pageType}/${reference.value?.slug}`;

    if (preview) {
      const url = new URL(href, window.location.origin);
      url.searchParams.append("preview", preview);
      href = url.pathname + url.search;
    }
  }

  if (!href) return null;

  const size = appearance === "link" ? "default" : sizeFromProps;
  const newTabProps = newTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

  /* Ensure we don't break any styles set by richText */
  if (appearance === "inline") {
    if (url) {
      return (
        <a
          className={cn("link", className)}
          href={href || url || ""}
          {...newTabProps}
          onClick={onClick}
        >
          {label && label}
          {children && children}
        </a>
      );
    }

    return (
      <Link
        className={cn("link", className)}
        to={href || url || ""}
        {...newTabProps}
        onClick={onClick}
      >
        {label && label}
        {children && children}
      </Link>
    );
  }

  if (url) {
    return (
      <a
        className={linkButtonVariants({ size, variant: appearance, className })}
        href={href || url || ""}
        {...newTabProps}
        onClick={onClick}
      >
        {label && label}
        {children && children}
      </a>
    );
  }

  return (
    <Link
      className={linkButtonVariants({ size, variant: appearance, className })}
      to={href || url || ""}
      {...newTabProps}
      onClick={onClick}
    >
      {label && label}
      {children && children}
    </Link>
  );
};
