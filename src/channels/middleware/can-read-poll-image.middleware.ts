import { NextFunction, Request, Response } from 'express';
import { GENERAL_CHANNEL_NAME } from '../../../common/channels/channel.constants';
import { dataSource } from '../../database/data-source';
import * as imagesService from '../../images/images.service';
import { User } from '../../users/user.entity';
import { Poll } from '../../polls/entities/poll.entity';

const pollRepository = dataSource.getRepository(Poll);

export const canReadPollImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { pollId, imageId } = req.params;

  const image = await imagesService.getImage(imageId);

  if (!image || image.pollId !== pollId) {
    res.status(404).send('Image not found');
    return;
  }

  if (!currentUser) {
    const isGeneralChannelPoll = await pollRepository.exist({
      where: { id: pollId, channel: { name: GENERAL_CHANNEL_NAME } },
    });
    if (!isGeneralChannelPoll) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  next();
};
