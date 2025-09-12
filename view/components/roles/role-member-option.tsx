import { User } from '../../types/user.types';
import { Checkbox } from '../ui/checkbox';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  checked?: boolean;
  defaultChecked?: boolean;
  handleChange(): void;
  user: User;
}

export const RoleMemberOption = ({
  checked,
  defaultChecked,
  handleChange,
  user,
}: Props) => (
  <div
    className="hover:bg-muted/50 mb-2 flex cursor-pointer items-center justify-between gap-5 rounded-lg p-3 last:mb-0"
    onClick={handleChange}
  >
    <div className="flex items-center">
      <UserAvatar userId={user.id} name={user.name} className="mr-3" />
      <span className="max-w-48 truncate select-none">
        {user.displayName || user.name}
      </span>
    </div>

    <Checkbox checked={checked} defaultChecked={defaultChecked} />
  </div>
);
