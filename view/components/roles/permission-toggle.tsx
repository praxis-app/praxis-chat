import { t } from 'i18next';
import { PermissionKeys } from '../../types/role.types';
import { getPermissionText } from '../../lib/role.utils';
import { Switch } from '../ui/switch';

interface Props {
  permissionName: PermissionKeys;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const PermissionToggle = ({ permissionName, checked, onChange }: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  return (
    <div className="flex justify-between items-start mb-7">
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={displayName || t('labels.switch')}
      />
    </div>
  );
};
