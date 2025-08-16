// TODO: Convert from MUI to Shadcn UI

import {
  Box,
  Card,
  FormControl,
  FormGroup,
  FormLabel,
  CardContent as MuiCardContent,
  OutlinedInput,
  styled,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { ROLE_COLOR_OPTIONS } from '../../constants/role.constants';
import { CreateRoleReq, Role } from '../../types/role.types';
import { ColorPicker } from '../shared/color-picker';
import PrimaryButton from '../shared/primary-button';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

interface Props {
  editRole?: Role;
}

const RoleForm = ({ editRole }: Props) => {
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
    <Card sx={{ marginBottom: '12px' }}>
      <CardContent>
        <form onSubmit={handleSubmit((fv) => handleSubmitForm(fv))}>
          <FormGroup>
            <FormControl sx={{ paddingBottom: 1.8 }}>
              <FormLabel sx={{ fontWeight: 500, paddingBottom: 0.5 }}>
                {t('roles.form.name')}
              </FormLabel>
              <OutlinedInput autoComplete="off" {...register('name')} />
            </FormControl>

            <ColorPicker
              color={watch('color')}
              key={colorPickerKey}
              label={t('roles.form.colorPickerLabel')}
              onChange={(color) => setValue('color', color)}
              sx={{ marginBottom: 1.25 }}
            />
          </FormGroup>

          <Box display="flex" justifyContent="end">
            <PrimaryButton
              disabled={isSubmitButtonDisabled()}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {editRole ? t('actions.save') : t('actions.create')}
            </PrimaryButton>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoleForm;
