import { NextFunction, Request, Response } from 'express';
import * as channelsService from '../../channels/channels.service';
import { dataSource } from '../../database/data-source';
import { Image } from '../../images/entities/image.entity';
import * as invitesService from '../../invites/invites.service';
import { User } from '../../users/user.entity';
import * as messagesService from '../messages.service';

const imageRepository = dataSource.getRepository(Image);

export const canReadMessageImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { serverId, channelId, messageId, imageId } = req.params;
  const { inviteToken } = req.query;

  // Check if the image exists
  const image = await imageRepository.findOne({
    select: ['id', 'messageId'],
    where: { id: imageId },
  });
  if (!image || image.messageId !== messageId) {
    res.status(404).send('Image not found');
    return;
  }

  if (!currentUser) {
    // Check if the message is in a public channel (a default server channel)
    const isPublicChannelMessage = await messagesService.isPublicChannelMessage(
      serverId,
      channelId,
      messageId,
    );
    if (isPublicChannelMessage) {
      next();
      return;
    }

    // Check if the user has been invited to the server for this message
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
