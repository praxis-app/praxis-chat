import { getPermissionText } from '@/lib/role.utils';
import { PermissionKeys } from '@/types/role.types';
import { UseFormSetValue } from 'react-hook-form';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { CreateProposalFormSchema } from '../create-proposal-form/create-proposa-form.types';

interface Props {
  permissionName: PermissionKeys;
  formPermissions: Record<PermissionKeys, boolean>;
  permissions: Record<PermissionKeys, boolean>;
  setValue: UseFormSetValue<CreateProposalFormSchema>;
}

export const ProposePermissionToggle = ({
  formPermissions,
  permissionName,
  permissions,
  setValue,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  const permissionInput = formPermissions && formPermissions[permissionName];
  const isEnabled = permissions[permissionName];
  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  // TODO: Remove unneeded entries near API call and review step instead of here
  const handleSwitchChange = (checked: boolean) => {
    const getNewValue = () => {
      if (!checked && isEnabled) {
        return false;
      }
      if (checked === isEnabled) {
        return undefined;
      }
      return true;
    };
    setValue('permissions', {
      ...formPermissions,
      [permissionName]: getNewValue(),
    });
  };

  return (
    <div className="flex items-center justify-between space-x-2 py-2">
      <div className="space-y-1">
        <Label
          htmlFor={`permission-${permissionName}`}
          className="text-sm font-medium"
        >
          {displayName}
        </Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>

      <Switch
        id={`permission-${permissionName}`}
        checked={isChecked}
        onCheckedChange={handleSwitchChange}
        aria-label={displayName}
      />
    </div>
  );
};
