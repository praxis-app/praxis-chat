import { Request, Response } from 'express';
import { Image } from '../images/entities/image.entity';
import { getUploadsPath } from '../images/images.utils';
import * as pollsService from './polls.service';

export const createPoll = async (req: Request, res: Response) => {
  const { serverId, channelId } = req.params;
  const poll = await pollsService.createPoll(
    serverId,
    channelId,
    req.body,
    res.locals.user,
  );
  res.json({ poll });
};

export const uploadPollImage = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }
  const { user } = res.locals;
  const { serverId, pollId, imageId } = req.params;
  const { filename } = req.file as Express.Multer.File;
  const image = await pollsService.savePollImage(
    serverId,
    pollId,
    imageId,
    filename,
    user,
  );

  res.status(201).json({ image });
};

export const deletePoll = async (req: Request, res: Response) => {
  const result = await pollsService.deletePoll(req.params.pollId);
  res.json(result);
};

export const getPollImage = async (_req: Request, res: Response) => {
  const image: Image & { filename: string } = res.locals.image;

  return res.sendFile(image.filename, {
    root: getUploadsPath(),
  });
};
