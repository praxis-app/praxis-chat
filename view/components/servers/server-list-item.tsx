import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { ServerRes } from '@/types/server.types';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { useTranslation } from 'react-i18next';
import { MdArrowForwardIos } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  server: ServerRes;
}

export const ServerListItem = ({ server }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const editPath = `${NavigationPaths.ManageServers}/${server.id}/edit`;

  const getInitial = (value: string) => {
    return (value?.trim()?.[0] || '?').toUpperCase();
  };

  const getStringAvatarProps = () => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(server.id || server.name);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

  return (
    <Link to={editPath}>
      <div className="hover:bg-ring/10 flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 transition-colors">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback
              className="text-lg font-light uppercase"
              {...getStringAvatarProps()}
            >
              {getInitial(server.name)}
            </AvatarFallback>
          </Avatar>

          <div className="w-full">
            <div
              className={cn(
                'flex items-center gap-2 truncate leading-tight',
                server.name.length > 20 &&
                  !isDesktop &&
                  'flex-col items-stretch gap-0',
              )}
            >
              <div className="truncate font-medium">{server.name}</div>
              <div className="text-muted-foreground truncate text-xs font-normal">
                /s/{server.slug}
              </div>
              {server.isDefaultServer && (
                <Badge variant="secondary" className="uppercase">
                  {t('servers.labels.default')}
                </Badge>
              )}
            </div>

            {server.description && (
              <p
                className="text-muted-foreground truncate pr-14 text-xs leading-tight"
                title={server.description}
              >
                {server.description}
              </p>
            )}
          </div>
        </div>

        <MdArrowForwardIos className="text-muted-foreground size-5 shrink-0" />
      </div>
    </Link>
  );
};
