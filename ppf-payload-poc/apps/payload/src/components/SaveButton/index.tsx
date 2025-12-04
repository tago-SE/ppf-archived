'use client'

import { useCookieMonitor } from "@/lib/utils/useCookieMonitor";
import { SaveButton, useDocumentInfo } from "@payloadcms/ui";
import { concatAST } from "graphql";
import { useMemo } from "react";

export const SaveButtonButtonClient = () => {
    const { initialData, action } = useDocumentInfo();
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
            </> : <SaveButton />}
        </>
    );
};

export default SaveButtonButtonClient;