import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { t } from './shared.utils';

export const handleError = (error: Error) => {
  if (error instanceof AxiosError && error.response?.data) {
    toast(error.response?.data);
    return;
  }
  toast(error.message || t('errors.somethingWentWrong'));
};
