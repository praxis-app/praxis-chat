import { Switch } from '@/components/ui/switch';
import { getPermissionText } from '@/lib/role.utils';
import { InstancePermissionKeys } from '@/types/role.types';
import { t } from 'i18next';

interface Props {
  permissionName: InstancePermissionKeys;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const InstanceRolePermissionToggle = ({
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
