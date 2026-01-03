"use client";

import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center space-y-6 p-8 max-w-lg">
                <div className="relative">
                    <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-500">
                        500
                    </h1>
                    <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 -z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
                <p className="text-white/40">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-xl hover:bg-rose-500/30 transition-all"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
