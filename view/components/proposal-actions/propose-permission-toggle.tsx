// TODO: Convert from Material UI to Shadcn UI

import { Box, Switch, Typography } from '@mui/material';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import theme from '../../../styles/theme';
import Flex from '../../Shared/Flex';
import { getPermissionText } from '@/lib/role.utils';

interface Props {
  formValues: any;
  permissionName: any;
  permissions: Partial<any>;
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
    formValues.permissions && formValues.permissions[permissionName];
  const isEnabled = permissions[permissionName];
  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  const handleSwitchChange = ({
    target: { checked },
  }: ChangeEvent<HTMLInputElement>) => {
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
    <Flex justifyContent="space-between" marginBottom={2.8}>
      <Box>
        <Typography>{displayName}</Typography>

        <Typography fontSize={12} sx={{ color: theme.palette.text.secondary }}>
          {description}
        </Typography>
      </Box>

      <Switch
        inputProps={{ 'aria-label': displayName || t('labels.switch') }}
        onChange={handleSwitchChange}
        checked={isChecked}
      />
    </Flex>
  );
};
