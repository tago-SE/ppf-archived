'use client'

import { useCookieMonitor } from "@/lib/utils/useCookieMonitor";
import { PublishButton, useDocumentInfo } from "@payloadcms/ui";
import { useMemo } from "react";

export const PublishButtonClient = () => {
    const { initialData } = useDocumentInfo();
    const selectedTenant = useCookieMonitor("payload-tenant", 50);

    const tenantChanged = useMemo(() => {
        if(selectedTenant == "_ALL_" || selectedTenant == "") {
            return false;
        }

        const initialTenant: string | undefined | null = typeof initialData?.tenant === "object" ? initialData.tenant?.id : initialData?.tenant;
        if(!initialTenant) {
            return false;
        }
        
        return initialTenant != selectedTenant;
    }, [selectedTenant, initialData])

    return (
        <>
            {tenantChanged ? <>
                <div className='text-error'>
                    <span>⚠️ Tenant change is not allowed!</span>
                </div>
            </> : <PublishButton />}
        </>
    );
};

export default PublishButtonClient;