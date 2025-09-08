import { User } from '@/types/user.types';
import { RoleMemberOption } from '../roles/role-member-option';

interface RoleMemberChange {
  userId: string;
  changeType: 'add' | 'remove';
}

interface Props {
  member: User;
  selectedMembers: RoleMemberChange[];
  setSelectedMembers(selectedMembers: RoleMemberChange[]): void;
  currentRoleMembers?: User[];
}

export const ProposeRoleMemberOption = ({
  member,
  selectedMembers,
  setSelectedMembers,
  currentRoleMembers,
}: Props) => {
  const isSelectedToAdd = selectedMembers.some(
    ({ userId, changeType }) => userId === member.id && changeType === 'add',
  );
  const isSelectedToRemove = selectedMembers.some(
    ({ userId, changeType }) => userId === member.id && changeType === 'remove',
  );
  const isAlreadyAdded = currentRoleMembers?.some(({ id }) => id === member.id);

  const checked = (isAlreadyAdded && !isSelectedToRemove) || isSelectedToAdd;

  const handleChange = () => {
    if ((!isAlreadyAdded && checked) || (isAlreadyAdded && !checked)) {
      setSelectedMembers(
        selectedMembers.filter(({ userId }) => userId !== member.id),
      );
      return;
    }
    const changeType = isAlreadyAdded && checked ? 'remove' : 'add';
    setSelectedMembers([...selectedMembers, { changeType, userId: member.id }]);
  };

  return (
    <RoleMemberOption
      handleChange={handleChange}
      checked={checked}
      user={member}
    />
  );
};
