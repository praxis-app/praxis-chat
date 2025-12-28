import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?(): void;
}

export const ServerSwitchDialog = ({ open, onOpenChange, onSelect }: Props) => {
  const { isLoggedIn } = useAppStore();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['me', 'servers'],
    queryFn: api.getCurrentUserServers,
    enabled: open && isLoggedIn,
  });

  const servers = data?.servers ?? [];

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    navigate(`/s/${slug}`);
    onSelect?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:w-xl">
        <DialogHeader>
          <DialogTitle>{t('navigation.labels.switchServers')}</DialogTitle>
          <DialogDescription>
            {t('servers.prompts.switchServersDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : servers.length ? (
          <div className="flex flex-col gap-2">
            {servers.map((server) => (
              <Button
                key={server.id}
                variant="ghost"
                className="h-fit items-start justify-between gap-3 px-3 py-3"
                onClick={() => handleSelect(server.slug)}
              >
                <div className="flex flex-col text-left">
                  <span className="leading-tight font-semibold">
                    {server.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    /s/{server.slug}
                  </span>
                  {server.description && (
                    <span className="text-muted-foreground mt-1 text-xs leading-snug">
                      {server.description}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('servers.prompts.noServersAvailable')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
