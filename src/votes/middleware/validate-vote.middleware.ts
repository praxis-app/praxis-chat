import { VOTE_TYPES } from '@common/votes/vote.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { dataSource } from '../../database/data-source';
import * as pollsService from '../../polls/polls.service';
import { Vote } from '../vote.entity';

const voteRepository = dataSource.getRepository(Vote);

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

    const { pollId } = req.params;
    const poll = await pollsService.getPoll(pollId, ['action']);

    // For non-test proposals, only registered users can vote
    if (poll.action.actionType !== 'test' && res.locals.user.anonymous) {
      res
        .status(403)
        .send('Only registered users can vote on non-test proposals');
      return;
    }

    if (poll.stage !== 'voting') {
      res.status(422).send('Poll is no longer accepting votes');
      return;
    }

    if (req.method === 'POST') {
      const vote = await voteRepository.findOne({
        where: { pollId, userId: res.locals.user.id },
      });
      if (vote) {
        res.status(422).send('You have already voted on this poll');
        return;
      }
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
