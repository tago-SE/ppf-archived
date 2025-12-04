export function getTenant() {
    let tenantSlug = import.meta.env.VITE_TENANT_SLUG;
    const params = new URLSearchParams(document.location.search);
    const preview = params.get('preview');
    if(preview == 'true') {
        tenantSlug = params.get('tenant');
    }

    return tenantSlug;
}