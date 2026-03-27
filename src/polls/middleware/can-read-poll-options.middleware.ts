import { NextFunction, Request, Response } from 'express';
import * as channelsService from '../../channels/channels.service';
import { dataSource } from '../../database/data-source';
import * as invitesService from '../../invites/invites.service';
import * as pollsService from '../../polls/polls.service';
import { User } from '../../users/user.entity';
import { PollOption } from '../entities/poll-option.entity';

const pollOptionRepository = dataSource.getRepository(PollOption);

export const canReadPollOptions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { serverId, channelId, pollId, pollOptionId } = req.params;
  const { inviteToken } = req.query;

  // Check if the poll option exists
  const pollOption = await pollOptionRepository.findOne({
    select: ['id', 'pollId'],
    where: { id: pollOptionId },
  });
  if (!pollOption || pollOption.pollId !== pollId) {
    res.status(404).send('Poll option not found');
    return;
  }

  if (!currentUser) {
    // Check if the poll is in a public channel (a default server channel)
    const isPublicChannelPoll = await pollsService.isPublicChannelPoll(
      serverId,
      channelId,
      pollId,
    );
    if (isPublicChannelPoll) {
      next();
      return;
    }

    // Check if the user has been invited to the server for this poll
    if (inviteToken && typeof inviteToken === 'string') {
      const isValid = await invitesService.isValidInvite({
        token: inviteToken,
        serverId: req.params.serverId,
      });
      if (isValid) {
        next();
        return;
      }
    }

    res.status(403).send('Forbidden');
    return;
  }

  // Check if the current user is a member of the channel
  const isChannelMember = await channelsService.isChannelMember(
    serverId,
    channelId,
    currentUser.id,
  );
  if (!isChannelMember) {
    res.status(403).send('Forbidden');
    return;
  }

  next();
};
