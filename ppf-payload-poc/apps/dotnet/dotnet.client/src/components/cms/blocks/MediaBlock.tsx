import React, { useMemo } from "react";
import type { MediaBlock as MediaBlockProps } from "@ppf/payload-renderer/payload-types";
import { cn } from "../../../utils/cn";
import { RichText } from "../components/RichText";
import { Media } from "../components/Media";

type Props = MediaBlockProps & {
  breakout?: boolean;
  captionClassName?: string;
  className?: string;
  enableGutter?: boolean;
  imgClassName?: string;
  staticImage?: string;
  disableInnerContainer?: boolean;
};

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props;

  let caption;
  if (media && typeof media === "object") caption = media.caption;

  const computedMedia = useMemo(() => {
    if (typeof media === "object") {
      if (media?.mediaSource === "upload") {
        const resource = { ...media };
        const originalUrl = new URL(resource.url ?? "");
        const proxyUrl = new URL(import.meta.env.VITE_SERVER_URL);
        proxyUrl.pathname += originalUrl.pathname;
        resource.url = proxyUrl.toString();
        return {
          resource,
        };
      } else {
        return {
          src: media.externalUrl,
        };
      }
    }
  }, [media]);

  return (
    <div
      className={cn(
        "",
        {
          container: enableGutter,
        },
        className
      )}
    >
      <Media
        imgClassName={cn("", imgClassName)}
        src={staticImage}
        {...computedMedia}
      />
      {caption && (
        <div
          className={cn(
            "mt-6",
            {
              container: !disableInnerContainer,
            },
            captionClassName
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  );
};
