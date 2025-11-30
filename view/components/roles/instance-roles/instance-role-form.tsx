import { api } from '@/client/api-client';
import { ROLE_COLOR_OPTIONS } from '@/constants/role.constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/shared/color-picker';
import { CreateRoleReq, InstanceRoleRes } from '@/types/role.types';

interface Props {
  editRole?: InstanceRoleRes;
}

export const InstanceRoleForm = ({ editRole }: Props) => {
  const [colorPickerKey, setColorPickerKey] = useState(0);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { handleSubmit, register, setValue, watch, reset, formState } =
    useForm<CreateRoleReq>({
      defaultValues: {
        color: editRole?.color || ROLE_COLOR_OPTIONS[0],
        name: editRole?.name || '',
      },
      mode: 'onChange',
    });

  const { mutate: createInstanceRole, isPending: isCreatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        const { instanceRole } = await api.createInstanceRole(data);

        queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
          ['instance-roles'],
          (oldData) => {
            if (!oldData) {
              return { instanceRoles: [] };
            }
            return { instanceRoles: [instanceRole, ...oldData.instanceRoles] };
          },
        );
      },
      onSuccess: () => {
        setColorPickerKey(Date.now());
        reset();
      },
    });

  const { mutate: updateInstanceRole, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        if (!editRole) {
          return;
        }
        await api.updateInstanceRole(editRole.id, data);

        const instanceRole = { ...editRole, ...data };
        queryClient.setQueryData<{ instanceRole: InstanceRoleRes }>(
          ['instance-roles', editRole.id],
          { instanceRole },
        );
        queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
          ['instance-roles'],
          (oldData) => {
            if (!oldData) {
              return { instanceRoles: [] };
            }
            return {
              instanceRoles: oldData.instanceRoles.map((r) =>
                r.id === instanceRole.id ? instanceRole : r,
              ),
            };
          },
        );

        return instanceRole;
      },
      onSuccess: (data) => {
        setColorPickerKey(Date.now());
        reset(data);
      },
    });

  const handleSubmitForm = (data: CreateRoleReq) => {
    if (editRole) {
      updateInstanceRole(data);
    } else {
      createInstanceRole(data);
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
