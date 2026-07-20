interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`border border-gray-200 rounded-lg p-4 bg-white
        ${onClick ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}
