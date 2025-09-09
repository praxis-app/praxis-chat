import { getPermissionText } from '@/lib/role.utils';
import { PermissionKeys } from '@/types/role.types';
import { CreateProposalFormSchema } from '../proposals/create-proposal-form/create-proposa-form.types';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface Props {
  formValues: Record<string, unknown>;
  permissionName: PermissionKeys;
  permissions: Partial<Record<PermissionKeys, boolean>>;
  setFieldValue(
    field: keyof CreateProposalFormSchema,
    value?: CreateProposalFormSchema[keyof CreateProposalFormSchema],
  ): void;
}

export const ProposePermissionToggle = ({
  formValues,
  permissionName,
  permissions,
  setFieldValue,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  const permissionInput =
    formValues.permissions &&
    (formValues.permissions as Record<string, boolean>)[permissionName];
  const isEnabled = permissions[permissionName];
  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && isEnabled) {
      setFieldValue('permissions', { ...permissions, [permissionName]: false });
      return;
    }
    if (checked === isEnabled) {
      setFieldValue('permissions', {
        ...permissions,
        [permissionName]: undefined,
      });
      return;
    }
    setFieldValue('permissions', { ...permissions, [permissionName]: true });
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
