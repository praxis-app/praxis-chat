import { cn } from '@/lib/shared.utils';

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar = ({ className }: ProgressBarProps) => {
  return (
    <div className={cn('flex items-center justify-center h-32', className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};