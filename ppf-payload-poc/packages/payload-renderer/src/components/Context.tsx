import { createContext, useContext } from "react";
import type { ContentBlock as ContentBlockProps } from "@payload-types";
import type { CodeBlock as CodeBlockProps } from "@payload-types";
import type { MediaBlock as MediaBlockProps } from "@payload-types";
import type { Page } from "@payload-types";

import { CMSButtonProps } from "./Button";
import { CMSLinkType } from "./CMSLink";
import { RichTextProps } from "./RichText";

type RenderContextType = {
  linkConfig?: {
    pathToPageTemplateMap?: Record<string, string>;
  };

  BlocksContainer: React.FC<{ children?: React.ReactNode }>;

  // Blocks
  ContentBlock: React.FC<ContentBlockProps>;
  CodeBlock: React.FC<CodeBlockProps>;
  MediaBlock: React.FC<MediaBlockProps>;
  //RelatedBlock: (props: MediaBlockProps) => ReactNode

  // Components
  CMSLink: React.FC<CMSLinkType>;
  Button: React.FC<CMSButtonProps>;
  RichText: React.FC<RichTextProps>;

  // Hero
  Hero: {
    HighImpactHero: React.FC<Page["hero"]>;
    MediumImpactHero: React.FC<Page["hero"]>;
    LowImpactHero: React.FC<Page["hero"]>;
  };
};

const RenderContext = createContext<RenderContextType | undefined>(undefined);

const useRender = () => {
  const context = useContext(RenderContext);
  if (!context) {
    throw new Error("No RenderContext.Provider found when calling useRender.");
  }

  return context;
};

export { RenderContext, useRender };
