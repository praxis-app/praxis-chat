import { Time } from '@/constants/shared.constants';
import dayjs from 'dayjs';
import { t } from './shared.utils';

export const formatDate = (timeStamp: string) =>
  dayjs(timeStamp).format('MMMM D, YYYY');

export const timeMessage = (
  timeStamp: string,
  timeDifference: number,
  endsIn = false,
) => {
  if (timeDifference < Time.Minute) {
    const minutes = 1;
    return t(`time.${endsIn ? 'minutesEndsIn' : 'minutes'}`, {
      count: minutes,
      minutes,
    });
  }
  if (timeDifference < Time.Hour) {
    const minutes = Math.round(timeDifference / Time.Minute);
    return t(`time.${endsIn ? 'minutesEndsIn' : 'minutes'}`, {
      count: minutes,
      minutes,
    });
  }
  if (timeDifference < Time.Day) {
    const hours = Math.round(timeDifference / Time.Hour);
    return t(`time.${endsIn ? 'hoursEndsIn' : 'hours'}`, {
      count: hours,
      hours,
    });
  }
  if (timeDifference < Time.Month) {
    const days = Math.round(timeDifference / Time.Day);
    return t(`time.${endsIn ? 'daysEndsIn' : 'days'}`, {
      count: days,
      days,
    });
  }
  return formatDate(timeStamp);
};

export const timeAgo = (timeStamp: string) => {
  const now = new Date().getTime();
  const time = new Date(timeStamp).getTime();
  const secondsPast = (now - time) / 1000;
  return timeMessage(timeStamp, secondsPast);
};

export const timeFromNow = (timeStamp: string, endsIn = false) => {
  const now = new Date().getTime();
  const time = new Date(timeStamp).getTime();
  const secondsFromNow = (time - now) / 1000;
  return timeMessage(timeStamp, secondsFromNow, endsIn);
};
