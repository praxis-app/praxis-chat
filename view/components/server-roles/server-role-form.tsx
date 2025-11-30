import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { ROLE_COLOR_OPTIONS } from '../../constants/server-role.constants';
import { useServerData } from '../../hooks/use-server-data';
import {
  CreateServerRoleReq,
  ServerRoleRes,
} from '../../types/server-role.types';
import { ColorPicker } from '../shared/color-picker';

interface Props {
  editRole?: ServerRoleRes;
}

export const ServerRoleForm = ({ editRole }: Props) => {
  const [colorPickerKey, setColorPickerKey] = useState(0);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const { handleSubmit, register, setValue, watch, reset, formState } =
    useForm<CreateServerRoleReq>({
      defaultValues: {
        color: editRole?.color || ROLE_COLOR_OPTIONS[0],
        name: editRole?.name || '',
      },
      mode: 'onChange',
    });

  const { mutate: createServerRole, isPending: isCreatePending } = useMutation({
    mutationFn: async (data: CreateServerRoleReq) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const { serverRole } = await api.createServerRole(serverId, data);

      queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
        ['servers', serverId, 'roles'],
        (oldData) => {
          if (!oldData) {
            return { serverRoles: [] };
          }
          return { serverRoles: [serverRole, ...oldData.serverRoles] };
        },
      );
    },
    onSuccess: () => {
      setColorPickerKey(Date.now());
      reset();
    },
  });

  const { mutate: updateServerRole, isPending: isUpdatePending } = useMutation({
    mutationFn: async (data: CreateServerRoleReq) => {
      if (!editRole || !serverId) {
        return;
      }
      await api.updateServerRole(serverId, editRole.id, data);

      const serverRole = { ...editRole, ...data };
      queryClient.setQueryData<{ serverRole: ServerRoleRes }>(
        ['servers', serverId, 'roles', editRole.id],
        {
          serverRole,
        },
      );
      queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
        ['servers', serverId, 'roles'],
        (oldData) => {
          if (!oldData) {
            return { serverRoles: [] };
          }
          return {
            serverRoles: oldData.serverRoles.map((r) =>
              r.id === serverRole.id ? serverRole : r,
            ),
          };
        },
      );

      return serverRole;
    },
    onSuccess: (data) => {
      setColorPickerKey(Date.now());
      reset(data);
    },
  });

  const handleSubmitForm = (data: CreateServerRoleReq) => {
    if (editRole) {
      updateServerRole(data);
    } else {
      createServerRole(data);
    }
  };

  const unsavedColorChange = () => {
    if (!editRole) {
      return false;
    }
    return editRole.color !== watch('color');
  };

  const isSubmitButtonDisabled = () => {
    if (isCreatePending || isUpdatePending) {
      return true;
    }
    if (unsavedColorChange()) {
      return false;
    }
    return !formState.isDirty;
  };

  return (
    <Card className="mb-3">
      <CardContent>
        <form onSubmit={handleSubmit((fv) => handleSubmitForm(fv))}>
          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label className="text-md text-muted-foreground font-normal">
                {t('roles.form.name')}
              </Label>
              <Input autoComplete="off" {...register('name')} />
            </div>

            <ColorPicker
              color={watch('color')}
              key={colorPickerKey}
              label={t('roles.form.colorPickerLabel')}
              onChange={(color) => setValue('color', color)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="mt-4"
              disabled={isSubmitButtonDisabled()}
              type="submit"
            >
              {editRole ? t('actions.save') : t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
