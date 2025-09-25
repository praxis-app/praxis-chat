import { CronJob } from 'cron';
import { NextFunction, Request, Response } from 'express';
import { CronExpression } from '../../common/common.constants';
import * as proposalsService from '../proposals.service';

const ONE_HOUR_MS = 1000 * 60 * 60;

let disableTimeout: NodeJS.Timeout | null = null;

const synchronizeProposalsJob = new CronJob(
  CronExpression.EVERY_5_MINUTES,
  async () => {
    await proposalsService.synchronizeProposals();
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
  if (disableTimeout === null) {
    addDisableTimeout();
  } else {
    resetDisableTimeout();
  }
  next();
};
