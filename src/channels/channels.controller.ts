import { Request, Response } from 'express';
import * as channelsService from './channels.service';

export const getChannel = async (req: Request, res: Response) => {
  const channel = await channelsService.getChannel(req.params.channelId);
  res.json({ channel });
};

export const getChannels = async (_: Request, res: Response) => {
  const channels = await channelsService.getChannelsSafely();
  res.json({ channels });
};

export const getJoinedChannels = async (_: Request, res: Response) => {
  const channels = await channelsService.getJoinedChannels(res.locals.user.id);
  res.json({ channels });
};

export const getGeneralChannel = async (_: Request, res: Response) => {
  const channel = await channelsService.getGeneralChannel();
  res.json({ channel });
};

export const getChannelFeed = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const feed = await channelsService.getChannelFeed(
    channelId,
    offset,
    limit,
    res.locals.user?.id,
  );
  res.json({ feed });
};

export const getGeneralChannelFeed = async (req: Request, res: Response) => {
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const feed = await channelsService.getGeneralChannelFeed(
    offset,
    limit,
    res.locals.user?.id,
  );
  res.json({ feed });
};

export const createChannel = async (req: Request, res: Response) => {
  const channel = await channelsService.createChannel(
    req.body,
    res.locals.user.id,
  );
  res.json({ channel });
};

export const updateChannel = async (req: Request, res: Response) => {
  const result = await channelsService.updateChannel(
    req.params.channelId,
    req.body,
  );
  res.json(result);
};

export const deleteChannel = async (req: Request, res: Response) => {
  const result = await channelsService.deleteChannel(req.params.channelId);
  res.json(result);
};
