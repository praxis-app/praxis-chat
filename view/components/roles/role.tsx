import { useIsDesktop } from '@/hooks/use-is-desktop';
import { MdArrowForwardIos, MdPerson } from 'react-icons/md';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../constants/shared.constants';
import { Role as RoleType } from '../../types/role.types';
import { Link } from 'react-router-dom';

interface Props {
  role: RoleType;
}

export const Role = ({ role: { id, color, name, memberCount } }: Props) => {
  const { t } = useTranslation();
  const isAboveMd = useIsDesktop();

  const editRolePath = `${NavigationPaths.Roles}/${id}/edit`;

  return (
    <Link to={editRolePath}>
      <div className="hover:bg-ring/10 cursor-pointer rounded-lg p-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              className="mr-6 h-10 w-10"
              style={{ backgroundColor: color }}
            >
              <AvatarFallback className="font-medium text-black">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="-mt-1 flex flex-col">
              <h3
                className={`truncate font-medium ${
                  isAboveMd ? 'max-w-[500px]' : 'max-w-[250px]'
                } -mb-1`}
              >
                {name}
              </h3>
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
