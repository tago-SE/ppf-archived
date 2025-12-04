import { useRender } from "./Context";
import type { ContentBlock as ContentBlockProps } from "@payload-types";

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { ContentBlock } = useRender();
  return <ContentBlock {...props} />;
};
