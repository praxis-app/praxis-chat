import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  actionLabel?: string;
  closingAction?: () => void;
  children: ReactNode;
}

export const Modal = ({ 
  open, 
  onClose, 
  title, 
  actionLabel, 
  closingAction, 
  children 
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
        {actionLabel && closingAction && (
          <div className="flex justify-end mt-4">
            <button
              onClick={closingAction}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};