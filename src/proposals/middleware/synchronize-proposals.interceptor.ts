import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import * as proposalService from '../proposals.service';

enum CronExpression {
  EVERY_5_MINUTES = '0 */5 * * * *',
}

const ONE_HOUR_MS = 1000 * 60 * 60;

let disableTimeout: NodeJS.Timeout | null = null;

const synchronizeProposalsJob = new CronJob(
  CronExpression.EVERY_5_MINUTES,
  async () => {
    await proposalService.synchronizeProposals();
  },
);

const addDisableTimeout = () => {
  disableTimeout = setTimeout(() => {
    synchronizeProposalsJob.stop();
  }, ONE_HOUR_MS);
};

const resetDisableTimeout = () => {
  clearTimeout(disableTimeout!);
  disableTimeout = null;
  addDisableTimeout();
};

export const synchronizeProposals = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!synchronizeProposalsJob.isActive) {
    synchronizeProposalsJob.start();
  }
  if (disableTimeout) {
    resetDisableTimeout();
  } else {
    addDisableTimeout();
  }
  next();
};
