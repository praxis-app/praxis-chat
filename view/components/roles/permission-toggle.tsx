import { Box, Switch, SwitchProps, Typography } from '@mui/material';
import { t } from 'i18next';
import { PermissionKeys } from '../../types/role.types';
import { getPermissionText } from '../../utils/role.utils';

interface Props {
  permissionName: PermissionKeys;
  checked: boolean;
  onChange: SwitchProps['onChange'];
}

const PermissionToggle = ({ permissionName, checked, onChange }: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  return (
    <Box display="flex" justifyContent="space-between" marginBottom={2.8}>
      <Box>
        <Typography>{displayName}</Typography>

        <Typography fontSize={12} color="textSecondary">
          {description}
        </Typography>
      </Box>

      <Switch
        inputProps={{ 'aria-label': displayName || t('labels.switch') }}
        checked={checked}
        onChange={onChange}
      />
    </Box>
  );
};

export default PermissionToggle;
