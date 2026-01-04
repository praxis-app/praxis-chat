import { NextFunction, Request, Response } from 'express';
import * as imagesService from '../../images/images.service';
import * as pollsService from '../../polls/polls.service';
import { User } from '../../users/user.entity';
import * as channelsService from '../channels.service';

export const canReadPollImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { serverId, channelId, pollId, imageId } = req.params;

  const image = await imagesService.getImage(imageId);

  if (!image || image.pollId !== pollId) {
    res.status(404).send('Image not found');
    return;
  }

  if (currentUser) {
    const isChannelMember = await channelsService.isChannelMember(
      serverId,
      channelId,
      currentUser.id,
    );
    if (!isChannelMember) {
      res.status(403).send('Forbidden');
      return;
    }
  } else {
    const isPublicChannelPoll = await pollsService.isPublicChannelPoll(
      serverId,
      channelId,
      pollId,
    );
    if (!isPublicChannelPoll) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  next();
};
