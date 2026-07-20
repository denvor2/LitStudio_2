type BadgeVariant = 'default' | 'draft' | 'editing' | 'proofread' | 'final' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  draft: 'bg-gray-100 text-gray-600',
  editing: 'bg-amber-100 text-amber-700',
  proofread: 'bg-blue-100 text-blue-700',
  final: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
      ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
