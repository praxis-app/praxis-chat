import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { ROLE_COLOR_OPTIONS } from '../../constants/role.constants';
import { CreateRoleReq, Role } from '../../types/role.types';
import { ColorPicker } from '../shared/color-picker';

interface Props {
  editRole?: Role;
}

export const RoleForm = ({ editRole }: Props) => {
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

  const { mutate: createRole, isPending: isCreatePending } = useMutation({
    mutationFn: async (data: CreateRoleReq) => {
      const { role } = await api.createRole(data);

      queryClient.setQueryData<{ roles: Role[] }>(['roles'], (oldData) => {
        if (!oldData) {
          return { roles: [] };
        }
        return { roles: [role, ...oldData.roles] };
      });
    },
    onSuccess: () => {
      setColorPickerKey(Date.now());
      reset();
    },
  });

  const { mutate: updateRole, isPending: isUpdatePending } = useMutation({
    mutationFn: async (data: CreateRoleReq) => {
      if (!editRole) {
        return;
      }
      await api.updateRole(editRole.id, data);

      const role = { ...editRole, ...data };
      queryClient.setQueryData<{ role: Role }>(['role', editRole.id], {
        role,
      });
      queryClient.setQueryData<{ roles: Role[] }>(['roles'], (oldData) => {
        if (!oldData) {
          return { roles: [] };
        }
        return {
          roles: oldData.roles.map((r) => {
            return r.id === role.id ? role : r;
          }),
        };
      });

      return role;
    },
    onSuccess: (data) => {
      setColorPickerKey(Date.now());
      reset(data);
    },
  });

  const handleSubmitForm = (data: CreateRoleReq) => {
    if (editRole) {
      updateRole(data);
    } else {
      createRole(data);
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
