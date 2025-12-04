import * as React from "react";
import { useRender } from "./Context";

export type CMSButtonProps = {
  size?: "default" | "sm" | "md" | "lg" | null;
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary";
  children?: React.ReactNode;
};

export const CMSButton: React.FC<CMSButtonProps> = (props) => {
  const { Button } = useRender();
  return <Button {...props} />;
};
