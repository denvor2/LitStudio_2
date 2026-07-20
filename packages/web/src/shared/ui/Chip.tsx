interface ChipProps {
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function Chip({ color = '#94a3b8', children, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full
        ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {children}
    </span>
  );
}
