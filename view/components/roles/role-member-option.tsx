import { User } from '../../types/user.types';
import { UserAvatar } from '../users/user-avatar';
import { Checkbox } from '../ui/checkbox';

interface Props {
  handleChange(): void;
  checked: boolean;
  user: User;
}

export const RoleMemberOption = ({ handleChange, user, checked }: Props) => (
  <div 
    className="flex items-center justify-between rounded-lg p-3 mb-2 last:mb-0 cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={handleChange}
  >
    <div className="flex items-center">
      <UserAvatar
        userId={user.id}
        name={user.name}
        className="mr-3"
      />
      <span className="mt-1 select-none">
        {user.displayName || user.name}
      </span>
    </div>

    <Checkbox checked={checked} />
  </div>
);
