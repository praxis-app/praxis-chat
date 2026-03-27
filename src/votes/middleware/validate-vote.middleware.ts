import { VOTE_TYPES } from '@common/votes/vote.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { dataSource } from '../../database/data-source';
import * as pollsService from '../../polls/polls.service';
import { Vote } from '../vote.entity';

const voteRepository = dataSource.getRepository(Vote);

// Schema for proposal votes (voteType required)
export const proposalVoteSchema = zod.object({
  voteType: zod.enum(VOTE_TYPES, {
    message: 'Invalid vote type',
  }),
});

// Schema for poll votes (pollOptionIds required)
export const pollVoteSchema = zod.object({
  pollOptionIds: zod
    .array(zod.uuid())
    .min(1, 'At least one poll option must be selected'),
});

export const validateVote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pollId } = req.params;
    const poll = await pollsService.getPoll(pollId, ['action']);
    const isProposal = poll.pollType === 'proposal';

    // Validate request body based on poll type
    if (['POST', 'PUT'].includes(req.method)) {
      if (isProposal) {
        proposalVoteSchema.parse(req.body);
      } else {
        pollVoteSchema.parse(req.body);
      }
    }

    // For non-test proposals, only registered users can vote
    if (
      isProposal &&
      res.locals.user.anonymous &&
      poll.action?.actionType !== 'test'
    ) {
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
