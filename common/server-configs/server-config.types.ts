import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import * as zod from 'zod';

export const serverConfigSchema = zod
  .object({
    decisionMakingModel: zod.enum(DECISION_MAKING_MODEL).optional(),
    disagreementsLimit: zod.number().min(0).max(10).optional(),
    abstainsLimit: zod.number().min(0).max(10).optional(),
    ratificationThreshold: zod.number().min(1).max(100).optional(),
    votingTimeLimit: zod.number().optional(),
  })
  .refine(
    (data) =>
      !(
        data.decisionMakingModel === 'majority-vote' &&
        data.ratificationThreshold !== undefined &&
        data.ratificationThreshold <= 50
      ),
    {
      message:
        'Ratification threshold must be greater than 50 for majority vote',
      path: ['ratificationThreshold'],
    },
  )
  .refine(
    (data) =>
      !(
        data.decisionMakingModel === 'consent' &&
        data.votingTimeLimit === VotingTimeLimit.Unlimited
      ),
    {
      message:
        'Voting time limit must be set for consent decision making model',
      path: ['votingTimeLimit'],
    },
  );
