// Ref: https://ui.shadcn.com/docs/components/tabs

import { cn } from '@/lib/shared.utils';
import * as React from 'react';

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || '');

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      data-value={activeTab}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value: activeTab,
            onValueChange: handleValueChange,
          } as any);
        }
        return child;
      })}
    </div>
  );
});
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    value: string;
  }
>(({ className, value, children, ...props }, ref) => {
  const tabsContext = React.useContext(TabsContext);
  const isActive = tabsContext?.value === value;

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50',
        className,
      )}
      onClick={() => tabsContext?.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    value: string;
  }
>(({ className, value, children, ...props }, ref) => {
  const tabsContext = React.useContext(TabsContext);
  const isActive = tabsContext?.value === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const TabsProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
TabsProvider.displayName = 'TabsProvider';

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsProvider };