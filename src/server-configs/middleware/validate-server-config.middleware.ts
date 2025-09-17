import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { NextFunction, Request, Response } from 'express';
import { ServerConfigDto } from '../server-config.types';
import { VotingTimeLimit } from '@common/votes/vote.constants';

export const validateServerConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    decisionMakingModel,
    disagreementsLimit,
    abstainsLimit,
    ratificationThreshold,
    votingTimeLimit,
  } = req.body as ServerConfigDto;

  if (
    decisionMakingModel &&
    !DECISION_MAKING_MODEL.includes(decisionMakingModel)
  ) {
    res
      .status(422)
      .send('Decision making model must be a valid decision making model');
    return;
  }
  if (
    disagreementsLimit &&
    (disagreementsLimit < 0 || disagreementsLimit > 10)
  ) {
    res.status(422).send('Disagreements limit must be between 0 and 10');
    return;
  }
  if (abstainsLimit && (abstainsLimit < 0 || abstainsLimit > 10)) {
    res.status(422).send('Abstains limit must be between 0 and 10');
    return;
  }
  if (
    ratificationThreshold &&
    (ratificationThreshold < 1 || ratificationThreshold > 100)
  ) {
    res.status(422).send('Ratification threshold must be between 1 and 100');
    return;
  }
  if (
    decisionMakingModel === 'majority-vote' &&
    ratificationThreshold &&
    ratificationThreshold <= 50
  ) {
    res
      .status(422)
      .send('Ratification threshold must be greater than 50 for majority vote');
    return;
  }
  if (
    decisionMakingModel === 'consent' &&
    votingTimeLimit === VotingTimeLimit.Unlimited
  ) {
    res
      .status(422)
      .send('Voting time limit must be set for consent decision making model');
    return;
  }
  next();
};
