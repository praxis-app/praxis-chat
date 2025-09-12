import { User } from '../../types/user.types';
import { Checkbox } from '../ui/checkbox';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  selectedUserIds: string[];
  setSelectedUserIds(selectedUsers: string[]): void;
  user: User;
}

export const RoleMemberOption = ({
  selectedUserIds,
  setSelectedUserIds,
  user,
}: Props) => {
  const isSelected = selectedUserIds.some((userId) => userId === user.id);

  const handleChange = () => {
    if (isSelected) {
      setSelectedUserIds(
        selectedUserIds.filter((userId) => userId !== user.id),
      );
      return;
    }
    setSelectedUserIds([...selectedUserIds, user.id]);
  };

  return (
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

      <Checkbox checked={isSelected} defaultChecked={isSelected} />
    </div>
  );
};
