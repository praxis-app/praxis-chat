import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

const serverConfigSchema = zod
  .object({
    decisionMakingModel: zod.enum(DECISION_MAKING_MODEL).optional(),
    disagreementsLimit: zod.number().min(0).max(10).optional(),
    abstainsLimit: zod.number().min(0).max(10).optional(),
    ratificationThreshold: zod.number().min(1).max(100).optional(),
    votingTimeLimit: zod.number().optional(),
  })
  .refine(
    (data) => {
      if (
        data.decisionMakingModel === 'majority-vote' &&
        data.ratificationThreshold !== undefined &&
        data.ratificationThreshold <= 50
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'Ratification threshold must be greater than 50 for majority vote',
    },
  )
  .refine(
    (data) => {
      if (
        data.decisionMakingModel === 'consent' &&
        data.votingTimeLimit === VotingTimeLimit.Unlimited
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'Voting time limit must be set for consent decision making model',
    },
  );

export const validateServerConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    serverConfigSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Validation failed';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
