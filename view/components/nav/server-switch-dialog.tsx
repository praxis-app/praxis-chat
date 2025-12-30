import { api } from '@/client/api-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
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

  const getInitial = (value: string) => {
    return (value?.trim()?.[0] || '?').toUpperCase();
  };

  const getStringAvatarProps = (serverId: string, serverName: string) => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(serverId || serverName);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

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
          <div className="flex min-w-0 flex-col gap-2">
            {servers.map((server) => (
              <Button
                key={server.id}
                variant="ghost"
                className="h-fit items-start gap-3 px-3 py-3"
                onClick={() => handleSelect(server.slug)}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback
                    className="text-lg font-light uppercase"
                    {...getStringAvatarProps(server.id, server.name)}
                  >
                    {getInitial(server.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex w-[70vw] min-w-0 flex-col text-left">
                  <div className="truncate leading-tight font-semibold">
                    {server.name}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    /s/{server.slug}
                  </div>
                  {server.description && (
                    <div className="text-muted-foreground mt-1 truncate text-xs leading-snug">
                      {server.description}
                    </div>
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
