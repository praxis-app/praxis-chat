import { useServerId } from '@/hooks/use-server-id';
import { getPermissionValues } from '@/lib/server-role.utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { PERMISSION_KEYS } from '../../constants/server-role.constants';
import {
  Permission,
  PermissionKeys,
  ServerRoleRes,
} from '../../types/server-role.types';
import { Button } from '../ui/button';
import { ServerRolePermissionToggle } from './server-role-permission-toggle';

// TODO: Add form schema with zod

// TODO: Convert `permissions` to hash map type
interface FormValues {
  permissions: {
    name: PermissionKeys;
    value: boolean;
  }[];
}

interface Props {
  serverRole: ServerRoleRes;
}

export const ServerRolePermissionsForm = ({ serverRole }: Props) => {
  const { serverId } = useServerId();

  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      permissions: getPermissionValues(serverRole.permissions),
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
            result.push({ subject: 'ServerRole', action: ['manage'] });
          }
          return result;
        },
        [],
      );
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.updateServerRolePermissions(serverId, serverRole.id, {
        permissions,
      });

      queryClient.setQueryData<{ serverRole: ServerRoleRes }>(
        [serverId, 'server-role', serverRole.id],
        (oldData) => {
          if (!oldData) {
            return { serverRole };
          }
          return { serverRole: { ...oldData.serverRole, permissions } };
        },
      );
      reset({ permissions: getPermissionValues(permissions) });
    },
  });

  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit((fv) => updatePermissions(fv))}>
      <Controller
        name="permissions"
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {PERMISSION_KEYS.map((permissionName, index) => (
              <ServerRolePermissionToggle
                key={permissionName}
                permissionName={permissionName}
                checked={value[index].value}
                onChange={(checked) => {
                  const newPermissions = [...value];
                  newPermissions[index].value = checked;
                  onChange(newPermissions);
                }}
              />
            ))}
          </>
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button disabled={isPending || !formState.isDirty} type="submit">
          {isPending ? t('states.saving') : t('actions.save')}
        </Button>
      </div>
    </form>
  );
};
