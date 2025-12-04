export function getPreview() {
    const params = new URLSearchParams(document.location.search);
    const preview = params.get('preview');
    if(preview !== null) {
        return preview;
    }

    return false;
}

export function getIsDraftMode() {
    return typeof getPreview() === 'string';
}