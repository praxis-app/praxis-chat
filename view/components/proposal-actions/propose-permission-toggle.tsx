import { getPermissionText } from '@/lib/role.utils';
import { PermissionKeys } from '@/types/role.types';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface Props {
  formValues: Record<string, unknown>;
  permissionName: PermissionKeys;
  permissions: Partial<Record<PermissionKeys, boolean>>;
  setFieldValue(field: string, value?: boolean): void;
}

export const ProposePermissionToggle = ({
  formValues,
  permissionName,
  permissions,
  setFieldValue,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  const permissionInput =
    formValues.permissions && (formValues.permissions as Record<string, boolean>)[permissionName];
  const isEnabled = permissions[permissionName];
  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  const handleSwitchChange = (checked: boolean) => {
    const field = `permissions.${permissionName}`;

    if (!checked && isEnabled) {
      setFieldValue(field, false);
      return;
    }
    if (checked === isEnabled) {
      setFieldValue(field, undefined);
      return;
    }
    setFieldValue(field, true);
  };

  return (
    <div className="flex items-center justify-between space-x-2 py-2">
      <div className="space-y-1">
        <Label htmlFor={`permission-${permissionName}`} className="text-sm font-medium">
          {displayName}
        </Label>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
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
