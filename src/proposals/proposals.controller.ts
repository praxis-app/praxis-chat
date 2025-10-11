import { Request, Response } from 'express';
import { Image } from '../images/entities/image.entity';
import { getUploadsPath } from '../images/images.utils';
import * as proposalsService from './proposals.service';

export const createProposal = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const proposal = await proposalsService.createProposal(
    channelId,
    req.body,
    res.locals.user,
  );
  res.json({ proposal });
};

export const uploadProposalImage = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }
  const { user } = res.locals;
  const { proposalId, imageId } = req.params;
  const { filename } = req.file as Express.Multer.File;
  const image = await proposalsService.saveProposalImage(
    proposalId,
    imageId,
    filename,
    user,
  );

  res.status(201).json({ image });
};

export const deleteProposal = async (req: Request, res: Response) => {
  const result = await proposalsService.deleteProposal(req.params.proposalId);
  res.json(result);
};

export const getProposalImage = async (_req: Request, res: Response) => {
  const image: Image & { filename: string } = res.locals.image;

  return res.sendFile(image.filename, {
    root: getUploadsPath(),
  });
};
