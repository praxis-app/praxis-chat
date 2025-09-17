import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { NextFunction, Request, Response } from 'express';
import { ServerConfigDto } from '../server-config.types';

export const validateServerConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    decisionMakingModel,
    standAsidesLimit,
    reservationsLimit,
    ratificationThreshold,
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
  if (standAsidesLimit && (standAsidesLimit < 0 || standAsidesLimit > 10)) {
    res.status(422).send('Stand asides limit must be between 0 and 10');
    return;
  }
  if (reservationsLimit && (reservationsLimit < 0 || reservationsLimit > 10)) {
    res.status(422).send('Reservations limit must be between 0 and 10');
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
  next();
};
