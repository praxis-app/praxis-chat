import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
} from '@/constants/shared.constants';
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

          <div className="flex min-w-0 flex-col gap-0.5 text-left">
            <div className="flex items-center gap-2 truncate leading-tight font-semibold">
              <div className="truncate">{server.name}</div>
              {server.isDefaultServer && (
                <Badge variant="secondary" className="shrink-0 uppercase">
                  {t('servers.labels.default')}
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground truncate text-xs">
              /s/{server.slug}
              {server.memberCount !== undefined &&
                `${MIDDOT_WITH_SPACES}${t('roles.labels.membersCount', {
                  count: server.memberCount,
                })}`}
            </div>
            {server.description && (
              <div className="text-muted-foreground truncate text-xs leading-snug">
                {server.description}
              </div>
            )}
          </div>
        </div>

        <MdArrowForwardIos className="text-muted-foreground size-5 shrink-0" />
      </div>
    </Link>
  );
};
