import { t } from 'i18next';
import { getPermissionText } from '../../lib/server-role.utils';
import { PermissionKeys } from '../../types/server-role.types';
import { Switch } from '../ui/switch';

interface Props {
  permissionName: PermissionKeys;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ServerRolePermissionToggle = ({
  permissionName,
  checked,
  onChange,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  return (
    <div className="mb-7 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={displayName || t('labels.switch')}
      />
    </div>
  );
};
