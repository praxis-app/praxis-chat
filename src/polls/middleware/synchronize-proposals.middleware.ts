import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import { CronExpression } from '../../common/common.constants';
import * as pollsService from '../polls.service';

const HALF_HOUR_MS = 1000 * 60 * 30;

let disableTimeout: NodeJS.Timeout | null = null;

const synchronizeProposalsJob = CronJob.from({
  cronTime: CronExpression.EVERY_5_MINUTES,
  onTick: async () => {
    await pollsService.synchronizeProposals();
  },
});

const addDisableTimeout = () => {
  disableTimeout = setTimeout(() => {
    synchronizeProposalsJob.stop();
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
 * TODO: Implement consent decision making model. `synchronizeProposals` basically
 * has no effect until consent is implemented, since it's the only model that
 * requires a set voting duration
 */
export const synchronizeProposals = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!synchronizeProposalsJob.isActive) {
    synchronizeProposalsJob.start();
  }
  if (disableTimeout === null) {
    addDisableTimeout();
  } else {
    resetDisableTimeout();
  }
  next();
};
