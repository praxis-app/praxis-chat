import { Request, Response } from 'express';
import * as channelsService from './channels.service';

export const getChannel = async (req: Request, res: Response) => {
  const { serverId, channelId } = req.params;
  const channel = await channelsService.getChannel(serverId, channelId);
  res.json({ channel });
};

export const getJoinedChannels = async (req: Request, res: Response) => {
  const channels = await channelsService.getJoinedChannels(
    req.params.serverId,
    res.locals.user.id,
  );
  res.json({ channels });
};

export const getGeneralChannel = async (req: Request, res: Response) => {
  const channel = await channelsService.getGeneralChannel(req.params.serverId);
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
    req.params.serverId,
    offset,
    limit,
    res.locals.user?.id,
  );
  res.json({ feed });
};

export const createChannel = async (req: Request, res: Response) => {
  const channel = await channelsService.createChannel(
    req.params.serverId,
    req.body,
  );
  res.json({ channel });
};

export const updateChannel = async (req: Request, res: Response) => {
  const result = await channelsService.updateChannel(
    req.params.serverId,
    req.params.channelId,
    req.body,
  );
  res.json(result);
};

export const deleteChannel = async (req: Request, res: Response) => {
  const result = await channelsService.deleteChannel(
    req.params.serverId,
    req.params.channelId,
  );
  res.json(result);
};
