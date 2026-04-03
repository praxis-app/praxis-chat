import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import { CronExpression } from '../../common/common.constants';
import * as pollsService from '../polls.service';

const HALF_HOUR_MS = 1000 * 60 * 30;

let disableTimeout: NodeJS.Timeout | null = null;

const closeExpiredPollsJob = CronJob.from({
  cronTime: CronExpression.EVERY_5_MINUTES,
  onTick: async () => {
    await pollsService.closeExpiredPolls();
  },
});

const addDisableTimeout = () => {
  disableTimeout = setTimeout(() => {
    closeExpiredPollsJob.stop();
    disableTimeout = null;
  }, HALF_HOUR_MS);
};

const resetDisableTimeout = () => {
  if (disableTimeout !== null) {
    clearTimeout(disableTimeout);
    disableTimeout = null;
  }
  addDisableTimeout();
};

/** Closes polls past their closingAt time on a cron schedule */
export const closeExpiredPolls = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!closeExpiredPollsJob.isActive) {
    closeExpiredPollsJob.start();
  }
  if (disableTimeout === null) {
    addDisableTimeout();
  } else {
    resetDisableTimeout();
  }
  next();
};
