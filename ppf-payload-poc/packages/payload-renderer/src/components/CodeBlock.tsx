import { useRender } from "./Context";
import type { CodeBlock as CodeBlockProps } from "@payload-types";

export const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const { CodeBlock } = useRender();
  return <CodeBlock {...props} />;
};
