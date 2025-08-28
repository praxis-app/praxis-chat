import { Button } from '../ui/button';
import { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton = ({ children, isLoading, disabled, ...buttonProps }: PrimaryButtonProps) => (
  <Button 
    disabled={disabled || isLoading}
    {...buttonProps}
  >
    {isLoading ? 'Loading...' : children}
  </Button>
);