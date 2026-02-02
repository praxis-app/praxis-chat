import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import { CronExpression } from '../../common/common.constants';
import * as pollsService from '../polls.service';

const HALF_HOUR_MS = 1000 * 60 * 30;

let disableTimeout: NodeJS.Timeout | null = null;

const synchronizePollsJob = CronJob.from({
  cronTime: CronExpression.EVERY_5_MINUTES,
  onTick: async () => {
    await pollsService.synchronizePolls();
  },
});

const addDisableTimeout = () => {
  disableTimeout = setTimeout(() => {
    synchronizePollsJob.stop();
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

/**
 * Synchronizes polls with regard to voting duration and ratifiability
 *
 * TODO: Implement consent decision making model. `synchronizePolls` basically
 * has no effect until consent is implemented, since it's the only model that
 * requires a set voting duration
 */
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
