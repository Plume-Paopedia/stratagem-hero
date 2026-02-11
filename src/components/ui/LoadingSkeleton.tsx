interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 p-8 h-full ${className}`}>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-4 bg-hd-border/30 rounded animate-pulse"
            style={{ width: `${80 - i * 15}%`, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="font-heading text-xs text-hd-gray/50 uppercase tracking-wider">
        Loading...
      </p>
    </div>
  );
}
