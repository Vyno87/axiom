export default function CardSkeleton() {
    return (
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-white/10 rounded w-1/2 animate-pulse" style={{ animationDelay: "100ms" }} />
            <div className="h-3 bg-white/10 rounded w-2/3 animate-pulse" style={{ animationDelay: "200ms" }} />
        </div>
    );
}
