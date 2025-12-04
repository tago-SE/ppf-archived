import {
  DefaultNodeTypes,
  SerializedBlockNode,
} from "@payloadcms/richtext-lexical";
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks,
} from "@payloadcms/richtext-lexical/react";
import type { CodeBlock as CodeBlockProps } from "@ppf/payload-renderer/payload-types";
import type { MediaBlock as MediaBlockProps } from "@ppf/payload-renderer/payload-types";
import type { BannerBlock as BannerBlockProps } from "@ppf/payload-renderer/payload-types";
import { CodeBlock } from "../blocks/CodeBlock";
import { Link } from "@tanstack/react-router";
import { cn } from "../../../utils/cn";
import { MediaBlock } from "../blocks/MediaBlock";
import { BannerBlock } from "./Banner";
import { ReusableBlock } from "@ppf/payload-renderer/payload-types";
import { RichTextProps } from "@ppf/payload-renderer";

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CodeBlockProps | MediaBlockProps | BannerBlockProps>;

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({
      nodes: node.children,
    });

    const rel: string | undefined = node.fields.newTab
      ? "noopener noreferrer"
      : undefined;
    const target: string | undefined = node.fields.newTab
      ? "_blank"
      : undefined;

    if (node.fields.linkType == "custom") {
      return (
        <a className="link" href={node.fields.url} rel={rel} target={target}>
          {children}
        </a>
      );
    }

    const slug = (
      (node.fields.doc?.value as {
        [key: string]: unknown;
        id: string;
      })["slug"] as string
    ).replace("home", "/");

    return (
      <Link className="link" to={slug} rel={rel} target={target}>
        {children}
      </Link>
    );
  },
  horizontalrule: () => <div className="divider"></div>,
  blocks: {
    banner: ({ node }) => (
      <BannerBlock className="col-start-2 mb-4" {...node.fields} />
    ),
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0 w-full object-cover"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    //cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
  relationship: ({ node, nodesToJSX }) => {
    if (node.relationTo == "reusable-blocks") {
      const reusableBlock = node.value as ReusableBlock;
      const blockNode = {
        type: "block",
        version: 2,
        format: "",
        fields: reusableBlock.content?.[0],
      } as SerializedBlockNode;

      return nodesToJSX({
        nodes: [blockNode],
      });
    }
  },
});

export const RichText: React.FC<RichTextProps> = (props) => {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          "container ": enableGutter,
          "max-w-none": !enableGutter,
          "mx-auto prose md:prose-md dark:prose-invert ": enableProse,
        },
        className
      )}
      {...rest}
    />
  );
};
