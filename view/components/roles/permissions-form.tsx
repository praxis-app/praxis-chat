import { Box } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { PERMISSION_KEYS } from '../../constants/role.constants';
import { Permission, PermissionKeys, Role } from '../../types/role.types';
import PrimaryButton from '../shared/primary-button';
import PermissionToggle from './permission-toggle';

interface FormValues {
  permissions: {
    name: PermissionKeys;
    value: boolean;
  }[];
}

interface Props {
  role: Role;
}

const getPermissionValues = (permissions: Permission[]) =>
  PERMISSION_KEYS.map((name) => {
    if (name === 'manageChannels') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Channel' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageSettings') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ServerConfig' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageRoles') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Role' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'createInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('create'),
        ),
        name,
      };
    }
    if (name === 'manageInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('manage'),
        ),
        name,
      };
    }
    return {
      value: false,
      name,
    };
  });

const PermissionsForm = ({ role }: Props) => {
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      permissions: getPermissionValues(role.permissions),
    },
  });

  const queryClient = useQueryClient();
  const { mutate: updatePermissions, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const permissions = values.permissions.reduce<Permission[]>(
        (result, permission) => {
          if (!permission.value) {
            return result;
          }
          if (permission.name === 'manageChannels') {
            result.push({ subject: 'Channel', action: ['manage'] });
          }
          if (permission.name === 'manageSettings') {
            result.push({ subject: 'ServerConfig', action: ['manage'] });
          }
          if (permission.name === 'createInvites') {
            result.push({ subject: 'Invite', action: ['read', 'create'] });
          }
          if (permission.name === 'manageInvites') {
            result.push({ subject: 'Invite', action: ['manage'] });
          }
          if (permission.name === 'manageRoles') {
            result.push({ subject: 'Role', action: ['manage'] });
          }
          return result;
        },
        [],
      );
      await api.updateRolePermissions(role.id, {
        permissions,
      });

      queryClient.setQueryData<{ role: Role }>(['role', role.id], (oldData) => {
        if (!oldData) {
          return { role };
        }
        return { role: { ...oldData.role, permissions } };
      });
      reset({ permissions: getPermissionValues(permissions) });
    },
  });

  const { t } = useTranslation();

  return (
    <Box
      onSubmit={handleSubmit((fv) => updatePermissions(fv))}
      component="form"
    >
      <Controller
        name="permissions"
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {PERMISSION_KEYS.map((permissionName, index) => (
              <PermissionToggle
                key={permissionName}
                permissionName={permissionName}
                checked={value[index].value}
                onChange={(e) => {
                  const newPermissions = [...value];
                  newPermissions[index].value = e.target.checked;
                  onChange(newPermissions);
                }}
              />
            ))}
          </>
        )}
      />

      <Box display="flex" justifyContent="end" sx={{ marginTop: 6 }}>
        <PrimaryButton
          disabled={isPending || !formState.isDirty}
          isLoading={isPending}
          type="submit"
        >
          {t('actions.save')}
        </PrimaryButton>
      </Box>
    </Box>
  );
};

export default PermissionsForm;
