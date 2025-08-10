import React, { ComponentProps, ElementType, ReactNode } from 'react';

interface BoxProps extends ComponentProps<ElementType> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ children, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} {...props}>
        {children}
      </Component>
    );
  },
);

Box.displayName = 'Box';
