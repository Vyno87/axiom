export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="h-16 bg-white/5 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                />
            ))}
        </div>
    );
}
