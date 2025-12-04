import { Link } from "@tanstack/react-router";
import { twMerge } from 'tailwind-merge'

export default function Logo({ className }: { className: string }) {
    return <Link to="/" className={twMerge("w-12 h-12", className)}>
        <img src="/if_logo.svg" className="w-full h-full"/>
    </Link>
}