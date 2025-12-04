import React, { FC, Fragment, ReactNode } from 'react'

import type { Props } from './types'
import { VideoMedia } from './VideoMedia'
import { ImageMedia } from './ImageMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = (htmlElement as FC<{ children: ReactNode, className?: string }>) || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
    </Tag>
  )
}