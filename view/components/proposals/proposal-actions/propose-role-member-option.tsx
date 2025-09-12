import { User } from '@/types/user.types';
import { RoleMemberOption } from '../../roles/role-member-option';

interface Props {
  member: User;
  selectedMembers: string[];
  setSelectedMembers(selectedMembers: string[]): void;
}

export const ProposeRoleMemberOption = ({
  member,
  selectedMembers,
  setSelectedMembers,
}: Props) => {
  const checked = selectedMembers.some((userId) => userId === member.id);

  const handleChange = () => {
    if (checked) {
      setSelectedMembers(
        selectedMembers.filter((userId) => userId !== member.id),
      );
      return;
    }
    setSelectedMembers([...selectedMembers, member.id]);
  };

  return (
    <RoleMemberOption
      handleChange={handleChange}
      defaultChecked={checked}
      user={member}
    />
  );
};
