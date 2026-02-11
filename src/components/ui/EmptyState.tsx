interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '\u{1F4ED}', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3 opacity-40">{icon}</div>
      <div className="font-heading font-bold text-sm text-hd-gray uppercase tracking-wider">
        {title}
      </div>
      {description && (
        <p className="text-xs text-hd-gray/50 mt-2 max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}
