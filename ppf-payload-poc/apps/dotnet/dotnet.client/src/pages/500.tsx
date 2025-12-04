import Logo from "../components/logo";

export default function Error(props: { error?: { message?: string } }) {
    return <div className="flex flex-col items-center px-10 min-h-[100vh]">
        <Logo className="w-16 h-16 my-10" />
        <h1 className="text-3xl mb-4">Unexpected error</h1>
        <p className="mb-12">Something went wrong</p>
        {props.error && props.error.message ? 
        <div className="mockup-code bg-base-200 text-base-content max-w-full md:max-w-[80%] lg:max-w-4xl">
            <pre><code className="text-wrap">{props.error.message}</code></pre>
        </div> : null}
    </div>
}