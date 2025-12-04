'use client'

import { Link, useConfig, useListDrawerContext } from "@payloadcms/ui";
import { UploadFieldClient } from "payload";
import { DefaultCellComponentProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { MediaCell } from "./mediaCell";

type IdNameCellProps = Omit<DefaultCellComponentProps<UploadFieldClient>, 'cellData'> & {
    cellData: { filename?: string; id?: string } | null;
};

const IdNameCell: React.FC<IdNameCellProps> = (props) => {
    const {
        cellData,
        className: classNameFromProps,
        collectionSlug,
        field,
        field: { admin },
        link: linkFromProps,
        onClick: onClickFromProps,
        rowData
    } = props

    const { drawerSlug, onSelect } = useListDrawerContext()

    const {
        config: {
            routes: { admin: adminRoute },
        },
        getEntityConfig,
    } = useConfig()

    const collectionConfig = getEntityConfig({ collectionSlug })

    const classNameFromConfigContext = admin && 'className' in admin ? admin.className : undefined

    const className =
        classNameFromProps ||
        (field.admin && 'className' in field.admin ? field.admin.className : null) ||
        classNameFromConfigContext

    let link = linkFromProps && drawerSlug ? false : true
    let onClick = !onClickFromProps && !link ? ({ collectionSlug: rowColl, rowData }: any) => {
        if (typeof onSelect === 'function') {
            onSelect({
                collectionSlug: rowColl,
                doc: rowData,
                docID: rowData.id as string,
            })
        }
    } : onClickFromProps;

    let WrapElement: React.ComponentType<any> | string = 'span'

    const wrapElementProps: {
        className?: string
        href?: string
        onClick?: () => void
        prefetch?: false
        type?: 'button'
    } = {
        className,
    }

    if (link) {
        wrapElementProps.prefetch = false
        WrapElement = Link
        wrapElementProps.href = collectionConfig?.slug
            ? formatAdminURL({
                adminRoute,
                path: `/collections/${collectionConfig?.slug}/${encodeURIComponent(rowData.id)}`,
            })
            : ''
    }

    if (typeof onClick === 'function') {
        WrapElement = 'button'
        wrapElementProps.type = 'button'
        wrapElementProps.onClick = () => {
            onClick({
                cellData,
                collectionSlug: collectionConfig?.slug,
                rowData,
            })
        }
    }

    return (
        <WrapElement {...wrapElementProps}>
            <MediaCell
                cellData={cellData}
                collectionConfig={collectionConfig}
                collectionSlug={collectionSlug}
                field={field}
                rowData={rowData}
            />
        </WrapElement>
    )
}

export default IdNameCell;