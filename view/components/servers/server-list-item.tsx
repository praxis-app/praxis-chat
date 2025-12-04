import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavigationPaths } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { ServerRes } from '@/types/server.types';
import { MdArrowForwardIos } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  server: ServerRes;
}

export const ServerListItem = ({ server }: Props) => {
  const isAboveMd = useIsDesktop();
  const editPath = `${NavigationPaths.ManageServers}/${server.id}/edit`;

  const getInitial = (value: string) => {
    return (value?.trim()?.[0] || '?').toUpperCase();
  };

  return (
    <Link to={editPath}>
      <div className="hover:bg-ring/10 cursor-pointer rounded-lg p-2 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-accent font-semibold uppercase">
                {getInitial(server.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div
                className={cn(
                  'flex items-center gap-2 truncate leading-tight font-medium',
                  isAboveMd ? 'max-w-[520px]' : 'max-w-[240px]',
                )}
              >
                <span className="truncate">{server.name}</span>
                <span className="text-muted-foreground truncate text-xs font-normal">
                  /s/{server.slug}
                </span>
              </div>

              {server.description && (
                <p
                  className={cn(
                    'text-muted-foreground truncate text-xs leading-tight',
                    isAboveMd ? 'max-w-[520px]' : 'max-w-[240px]',
                  )}
                  title={server.description}
                >
                  {server.description}
                </p>
              )}
            </div>
          </div>

          <MdArrowForwardIos className="text-muted-foreground size-5 shrink-0" />
        </div>
      </div>
    </Link>
  );
};
