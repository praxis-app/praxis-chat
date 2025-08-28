import { Button } from '../ui/button';
import { ButtonHTMLAttributes } from 'react';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const DeleteButton = ({ children, className, ...buttonProps }: DeleteButtonProps) => (
  <Button 
    variant="outline" 
    className={`w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground ${className || ''}`}
    {...buttonProps}
  >
    {children}
  </Button>
);
