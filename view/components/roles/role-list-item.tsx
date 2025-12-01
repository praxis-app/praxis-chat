import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { useTranslation } from 'react-i18next';
import { MdArrowForwardIos, MdPerson } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  to: string;
  color: string;
  name: string;
  memberCount: number;
}

export const RoleListItem = ({ to, color, name, memberCount }: Props) => {
  const { t } = useTranslation();
  const isAboveMd = useIsDesktop();

  return (
    <Link to={to}>
      <div className="hover:bg-ring/10 cursor-pointer rounded-lg p-2 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="mr-4 size-10">
              <AvatarFallback
                className="font-medium text-black"
                style={{ backgroundColor: color }}
              >
                <MdPerson className="size-7" />
              </AvatarFallback>
            </Avatar>

            <div className="-mt-1 flex flex-col">
              <div
                className={cn(
                  'mb-0.5 truncate',
                  isAboveMd ? 'max-w-[500px]' : 'max-w-[250px]',
                )}
              >
                {name}
              </div>
              <div className="text-muted-foreground flex items-center text-xs">
                <MdPerson className="mr-1 size-4" />
                {t('roles.labels.membersCount', { count: memberCount })}
              </div>
            </div>
          </div>

          <MdArrowForwardIos className="text-muted-foreground size-5" />
        </div>
      </div>
    </Link>
  );
};
