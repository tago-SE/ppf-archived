import React from 'react'
import type { Props as MediaProps } from '../types'
import { cn } from '../../../../../utils/cn'

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    imgClassName,
    resource,
    /* size: sizeFromProps, */
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: string | undefined = srcFromProps || undefined

  if (!src && resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      /* filename: fullFilename, */
      height: fullHeight,
      url,
      width: fullWidth,
      mediaSource,
      externalUrl
    } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''
    src = mediaSource === "upload" ? url : externalUrl
  }

  const loading = loadingFromProps || 'lazy'

  return (
    <picture>
      <img
        alt={alt || ''}
        className={cn(imgClassName)}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading={loading}
        src={src}
      />
    </picture>
  )
}
