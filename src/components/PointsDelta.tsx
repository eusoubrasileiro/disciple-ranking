import { TrendingUp, TrendingDown } from 'lucide-react';

interface PointsDeltaProps {
  delta?: number;
  size?: 'sm' | 'md';
}

export function PointsDelta({ delta, size = 'sm' }: PointsDeltaProps) {
  // Don't show anything if delta is undefined or zero
  if (delta === undefined || delta === 0) {
    return null;
  }

  const isPositive = delta > 0;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-medium ${textSize} ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {isPositive ? (
        <TrendingUp className={iconSize} />
      ) : (
        <TrendingDown className={iconSize} />
      )}
      <span>{isPositive ? '+' : ''}{delta}</span>
    </span>
  );
}
