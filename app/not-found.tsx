import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center space-y-6 p-8">
                <div className="relative">
                    <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                        404
                    </h1>
                    <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 -z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                <p className="text-white/40 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
