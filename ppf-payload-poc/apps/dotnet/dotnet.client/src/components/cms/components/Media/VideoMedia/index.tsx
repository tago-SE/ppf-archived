import React from 'react'
import type { Props as MediaProps } from '../types'
import { cn } from '../../../../../utils/cn'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  if (resource && typeof resource === 'object') {
    const { url } = resource

    return (
      <video
        className={cn(videoClassName)}
        controls={true}
        loop
        muted
        onClick={onClick}
        playsInline
      >
        <source src={url!} />
      </video>
    )
  }

  return null
}
