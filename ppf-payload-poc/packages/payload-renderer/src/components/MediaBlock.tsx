import { useRender } from "./Context";
import type { MediaBlock as MediaBlockProps } from "@payload-types";

export const MediaBlock: React.FC<MediaBlockProps> = (props) => {
  const { MediaBlock } = useRender();
  return <MediaBlock {...props} />;
};
