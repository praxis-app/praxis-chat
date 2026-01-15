import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import { CronExpression } from '../../common/common.constants';
import * as pollsService from '../polls.service';

const ONE_HOUR_MS = 1000 * 60 * 60;

let disableTimeout: NodeJS.Timeout | null = null;

// TODO: Ensure change here actually resolved timing issues
const synchronizePollsJob = CronJob.from({
  cronTime: CronExpression.EVERY_5_MINUTES,
  onTick: async () => {
    await pollsService.synchronizePolls();
  },
  waitForCompletion: true,
});

const addDisableTimeout = () => {
  disableTimeout = setTimeout(() => {
    synchronizePollsJob.stop();
  }, ONE_HOUR_MS);
};

const resetDisableTimeout = () => {
  clearTimeout(disableTimeout!);
  disableTimeout = null;
  addDisableTimeout();
};

export const synchronizePolls = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!synchronizePollsJob.isActive) {
    synchronizePollsJob.start();
  }
  if (disableTimeout === null) {
    addDisableTimeout();
  } else {
    resetDisableTimeout();
  }
  next();
};
