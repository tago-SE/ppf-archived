import { CMSButtonProps } from "./Button";
import { Page } from "@payload-types";
import { useRender } from "./Context";

export type CMSLinkType = {
  appearance?: "inline" | CMSButtonProps["variant"] | null;
  children?: React.ReactNode;
  className?: string;
  label?: string | null;
  newTab?: boolean | null;
  reference?: {
    relationTo: "pages";
    value: Page | string | number;
  } | null;
  size?: CMSButtonProps["size"] | null;
  type?: "custom" | "reference" | null;
  url?: string | null;
};

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const { CMSLink } = useRender();
  return <CMSLink {...props} />;
};
