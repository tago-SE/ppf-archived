export function Meta({
    meta
} : {
    meta?: {
        title?: string | undefined | null,
        description?: string | undefined | null
    } | undefined | null
}) {
    return <>
        {meta?.title ? <title>{meta.title}</title> : null}
        {meta?.description ? <meta name="description" content={meta.description} /> : null}
    </>
}