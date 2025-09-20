import { VOTE_TYPES } from '@common/votes/vote.constants';
import { NextFunction, Request, Response } from 'express';
import * as proposalsService from '../../proposals/proposals.service';
import * as zod from 'zod';

export const voteSchema = zod.object({
  voteType: zod.enum(VOTE_TYPES, {
    message: 'Invalid vote type',
  }),
});

export const validateVote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure shape and types are correct for POST and PUT requests
    if (['POST', 'PUT'].includes(req.method)) {
      voteSchema.parse(req.body);
    }

    const { proposalId } = req.params;
    const proposal = await proposalsService.getProposal(proposalId);
    if (proposal.stage === 'ratified') {
      res
        .status(422)
        .send('Proposal has been ratified and can no longer be voted on');
      return;
    }

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
