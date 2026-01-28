import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuX } from 'react-icons/lu';
import * as z from 'zod';

const MIN_OPTIONS = 2;

const createPollFormSchema = z.object({
  body: z.string().min(1, 'polls.errors.questionRequired'),
  options: z
    .array(
      z.object({ value: z.string().min(1, 'polls.errors.answerRequired') }),
    )
    .min(MIN_OPTIONS, 'polls.errors.minAnswersRequired'),
  closingAt: z.number().optional(),
  allowMultipleAnswers: z.boolean(),
});

type CreatePollFormSchema = z.infer<typeof createPollFormSchema>;

interface Props {
  onSubmit: (data: CreatePollFormSchema) => void;
  isSubmitting?: boolean;
}

export const CreatePollForm = ({ onSubmit, isSubmitting }: Props) => {
  const { t } = useTranslation();

  const form = useForm<CreatePollFormSchema>({
    resolver: zodResolver(createPollFormSchema),
    defaultValues: {
      body: '',
      options: [{ value: '' }, { value: '' }],
      closingAt: VotingTimeLimit.OneDay,
      allowMultipleAnswers: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const handleAddOption = () => {
    append({ value: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length > MIN_OPTIONS) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.question')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('polls.placeholders.question')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>{t('polls.labels.answers')}</FormLabel>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`options.${index}.value`}
              render={({ field: inputField }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder={t('polls.placeholders.answer', {
                          number: index + 1,
                        })}
                        {...inputField}
                      />
                    </FormControl>
                    {fields.length > MIN_OPTIONS && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        className="shrink-0"
                      >
                        <LuX className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddOption}
            className="mt-2"
          >
            <LuPlus className="mr-1 size-4" />
            {t('polls.actions.addAnswer')}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="closingAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.duration')}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('polls.placeholders.duration')}
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

        <FormField
          control={form.control}
          name="allowMultipleAnswers"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                {t('polls.labels.allowMultipleAnswers')}
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {t('polls.actions.createPoll')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export type { CreatePollFormSchema };
