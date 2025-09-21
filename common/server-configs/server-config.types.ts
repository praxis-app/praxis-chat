import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import * as zod from 'zod';
import { ServerConfigErrorKeys } from './server-config.constants';

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
      message: ServerConfigErrorKeys.MajorityVoteRatificationThreshold,
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
      message: ServerConfigErrorKeys.ConsentVotingTimeLimitRequired,
      path: ['votingTimeLimit'],
    },
  );
