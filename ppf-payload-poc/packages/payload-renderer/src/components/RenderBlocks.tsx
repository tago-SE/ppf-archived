import React, { Fragment, useMemo } from "react";
import { ContentBlock } from "./ContentBlock";
import type { Page, ReusableBlock } from "@payload-types";
import { CodeBlock } from "./CodeBlock";
import { useRender } from "./Context";
import { MediaBlock } from "./MediaBlock";

const blockComponents = {
  //cta: CallToActionBlock,
  content: ContentBlock,
  code: CodeBlock,
  mediaBlock: MediaBlock,
  //archive: ArchiveBlock,
  //relatedPosts: RelatedPosts,
  //comments: CommentsBlock,
};

export const RenderBlocks: React.FC<{
  blocks: Page["layout"];
  disableTopPadding?: boolean;
}> = (props) => {
  const { BlocksContainer } = useRender();
  const { blocks } = props;
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;
  const renderBlocks = useMemo(() => {
    return (
      blocks
        ?.flatMap((block) => {
          if (block.useLinkedBlock) {
            return (block.linkedBlock as ReusableBlock)?.content;
          } else {
            return block.customBlocks;
          }
        })
        .filter((x) => !!x) ?? []
    );
  }, [blocks]);

  if (hasBlocks) {
    return (
      <Fragment>
        {renderBlocks.map((block, index) => {
          const { blockType } = block;

          if (blockType && blockType in blockComponents) {
            // @ts-ignore
            const Block = blockComponents[blockType];

            if (Block) {
              return (
                <BlocksContainer key={index}>
                  <Block {...block} />
                </BlocksContainer>
              );
            }
          }

          return null;
        })}
      </Fragment>
    );
  }

  return null;
};
