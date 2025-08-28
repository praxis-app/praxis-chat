import { RoleMemberOption } from './role-member-option';
import { User } from '../../types/user.types';

interface Props {
  selectedUserIds: string[];
  setSelectedUserIds(selectedUsers: string[]): void;
  user: User;
}

export const AddRoleMemberOption = ({
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
    <RoleMemberOption
      handleChange={handleChange}
      checked={isSelected}
      user={user}
    />
  );
};
