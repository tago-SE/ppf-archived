'use client'

import { Thumbnail } from "@payloadcms/ui";
import { ClientCollectionConfig, UploadFieldClient } from "payload";
import { DefaultCellComponentProps } from "payload";
import { isImage } from "payload/shared";

interface MediaCellProps extends
    Omit<DefaultCellComponentProps<UploadFieldClient>, 'cellData'> {
    cellData: { filename?: string; id?: string } | null;
    readonly collectionConfig: ClientCollectionConfig;
}

const baseClass = 'file'

const getBestFitFromSizes = ({
    sizes,
    targetSizeMax = 180,
    targetSizeMin = 40,
    thumbnailURL,
    url,
    width,
}: {
    sizes?: Record<string, { url?: string; width?: number }>
    targetSizeMax?: number
    targetSizeMin?: number
    thumbnailURL?: string
    url: string
    width?: number
}) => {
    if (thumbnailURL) {
        return thumbnailURL
    }

    if (!sizes) {
        return url
    }

    const bestFit = Object.values(sizes).reduce<{
        original?: boolean
        url?: string
        width?: number
    }>(
        (closest, current) => {
            if (!current.width || current.width < targetSizeMin) {
                return closest
            }

            if (current.width >= targetSizeMin && current.width <= targetSizeMax) {
                return !closest.width ||
                    current.width < closest.width ||
                    closest.width < targetSizeMin ||
                    closest.width > targetSizeMax
                    ? current
                    : closest
            }

            if (
                !closest.width ||
                (!closest.original && closest.width < targetSizeMin && current.width > closest.width) ||
                (closest.width > targetSizeMax && current.width < closest.width)
            ) {
                return current
            }

            return closest
        },
        { original: true, url, width },
    )

    return bestFit.url || url
}

export const MediaCell: React.FC<MediaCellProps> = ({
    cellData: data,
    collectionConfig,
    field,
    rowData,
}) => {
    const fieldPreviewAllowed = 'displayPreview' in field ? field.displayPreview : undefined
    const previewAllowed = fieldPreviewAllowed ?? collectionConfig.upload?.displayPreview ?? true

    if (previewAllowed) {
        const isFileImage = isImage(rowData?.mimeType)
        let fileSrc: string | undefined = isFileImage
            ? rowData?.thumbnailURL || rowData?.url
            : rowData?.thumbnailURL

        if (isFileImage) {
            fileSrc = getBestFitFromSizes({
                sizes: rowData?.sizes,
                thumbnailURL: rowData?.thumbnailURL,
                url: rowData?.url,
                width: rowData?.width,
            })
        }

        return (
            <div className={baseClass}>
                <Thumbnail
                    className={`${baseClass}__thumbnail`}
                    collectionSlug={collectionConfig?.slug}
                    doc={{
                        ...rowData,
                        data,
                    }}
                    fileSrc={fileSrc}
                    size="small"
                    uploadConfig={collectionConfig?.upload}
                />
                {data?.filename ?
                    <>
                        <span className={`${baseClass}__filename`}>{String(data?.filename)}</span>
                    </> :
                    <div className="ml-5">
                        <code className="code-cell" style={{ whiteSpace: 'nowrap' }}>
                            <span>ID: {data?.id}</span>
                        </code>
                    </div>
                }
            </div>
        )
    } else {
        return <>{String(data)}</>
    }
}