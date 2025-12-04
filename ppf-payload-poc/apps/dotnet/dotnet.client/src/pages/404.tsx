import { useQueryClient } from "@tanstack/react-query";
import Logo from "../components/logo";
import { Loading } from "../components/loading";

export default function NotFound() {
    const queryClient = useQueryClient();
    const queryState = queryClient.getQueryState(['init']);

    // Show loading indicator if initial request is still loading. 
    // This is needed to ensure 404 is not shown if locales aren't feteched from CMS yet and URL contains a locale
    if(queryState && queryState.status == "pending") {
        return <Loading/>
    }

    return <div className="flex flex-col items-center px-10 min-h-[100vh]">
        <Logo className="w-16 h-16 my-10" />
        <h1 className="text-2xl mb-4">404: Page Not Found</h1>
        <p className="mb-12">We couldn’t find what you were looking for.</p>
    </div>
}