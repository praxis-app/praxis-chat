import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import { VotingTimeLimit } from '@/constants/proposal.constants';
import { ServerConfigReq, ServerConfigRes } from '@/types/server-config.types';
import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';

interface Props {
  serverConfig: ServerConfigRes;
}

const proposalSettingsFormSchema = zod.object({
  decisionMakingModel: zod.enum(DECISION_MAKING_MODEL),
  ratificationThreshold: zod.number(),
  reservationsLimit: zod.number(),
  standAsidesLimit: zod.number(),
  votingTimeLimit: zod.number(),
});

export const ProposalSettingsForm = ({ serverConfig }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<zod.infer<typeof proposalSettingsFormSchema>>({
    defaultValues: serverConfig,
    mode: 'onChange',
  });

  const { mutate: updateServerConfig, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (data: ServerConfigReq) => {
        await api.updateServerConfig(data);

        queryClient.setQueryData<{ serverConfig: ServerConfigRes }>(
          ['serverConfig'],
          (oldData) => {
            if (!oldData) {
              return { serverConfig: { ...data, updatedAt: new Date() } };
            }
            return {
              serverConfig: {
                ...oldData.serverConfig,
                ...data,
                updatedAt: new Date(),
              },
            };
          },
        );
      },
      onSuccess: () => {
        form.reset(form.getValues());
      },
      onError: (error: AxiosError) =>
        toast(
          (error.response?.data as string) || t('errors.somethingWentWrong'),
        ),
    });

  const handleSliderInputBlur = (value?: number | null) => {
    if (value === undefined || value === null) {
      return;
    }
    if (value < 0) {
      form.setValue('ratificationThreshold', 0);
      return;
    }
    if (value > 100) {
      form.setValue('ratificationThreshold', 100);
      return;
    }
    if (!Number.isInteger(value)) {
      form.setValue('ratificationThreshold', Math.round(value));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => updateServerConfig(fv))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="decisionMakingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.decisionMakingModel')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.decisionMakingModel')}
              </FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.decisionMakingModel')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DECISION_MAKING_MODEL.map((option) => (
                    <SelectItem value={option} key={option}>
                      {(() => {
                        if (option === 'consent') {
                          return t('proposals.labels.consent');
                        }
                        if (option === 'majority-vote') {
                          return t('proposals.labels.majority');
                        }
                        return t('proposals.labels.consensus');
                      })()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standAsidesLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.standAsidesLimit')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.standAsidesLimit')}
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.standAsidesLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array(11)
                    .fill(0)
                    .map((_, value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reservationsLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.reservationsLimit')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.reservationsLimit')}
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.reservationsLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array(11)
                    .fill(0)
                    .map((_, value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ratificationThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.ratificationThreshold')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.ratificationThreshold')}
              </FormDescription>
              <div className="flex gap-3">
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="mb-0 w-full"
                  />
                </FormControl>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={() => handleSliderInputBlur(field.value)}
                      className="w-20"
                    />
                  </FormControl>
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="votingTimeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.votingTimeLimit')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.votingTimeLimit')}
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.votingTimeLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={VotingTimeLimit.HalfHour.toString()}>
                    {t('time.minutesFull', { count: 30 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneHour.toString()}>
                    {t('time.hoursFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.HalfDay.toString()}>
                    {t('time.hoursFull', { count: 12 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneDay.toString()}>
                    {t('time.daysFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.ThreeDays.toString()}>
                    {t('time.daysFull', { count: 3 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneWeek.toString()}>
                    {t('time.weeks', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.TwoWeeks.toString()}>
                    {t('time.weeks', { count: 2 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.Unlimited.toString()}>
                    {t('time.unlimited')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            disabled={
              isUpdatePending ||
              !form.formState.isValid ||
              !form.formState.isDirty
            }
            type="submit"
            className="w-20"
          >
            {t('actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
