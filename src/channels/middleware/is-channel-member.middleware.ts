import { NextFunction, Request, Response } from 'express';
import * as channelsService from '../channels.service';

export const isChannelMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isChannelMember = await channelsService.isChannelMember(
    req.params.serverId,
    req.params.channelId,
    res.locals.user.id,
  );
  if (!isChannelMember) {
    res.status(403).send('Forbidden');
    return;
  }
  next();
};
