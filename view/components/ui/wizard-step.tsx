import { cn } from '../../lib/shared.utils';
import { LuCheck } from 'react-icons/lu';

interface WizardStepProps {
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  isClickable?: boolean;
  onClick?: () => void;
}

export const WizardStep = ({
  title,
  description,
  isActive,
  isCompleted,
  isClickable = false,
  onClick,
}: WizardStepProps) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-3 rounded-lg transition-colors',
        isClickable && 'cursor-pointer hover:bg-muted/50',
        isActive && 'bg-primary/10 border border-primary/20'
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted && 'bg-primary border-primary text-primary-foreground',
          isActive && !isCompleted && 'border-primary text-primary',
          !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <LuCheck className="h-4 w-4" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-current" />
        )}
      </div>
      <div className="flex-1">
        <h3
          className={cn(
            'text-sm font-medium transition-colors',
            isActive && 'text-primary',
            !isActive && 'text-muted-foreground'
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};