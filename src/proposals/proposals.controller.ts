import { Request, Response } from 'express';
import * as proposalsService from './proposals.service';

export const getProposal = async (req: Request, res: Response) => {
  const proposal = await proposalsService.getProposal(req.params.proposalId);
  res.json({ proposal });
};

export const createProposal = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const proposal = await proposalsService.createProposal(
    channelId,
    req.body,
    res.locals.user,
  );
  res.json({ proposal });
};

export const deleteProposal = async (req: Request, res: Response) => {
  const result = await proposalsService.deleteProposal(req.params.proposalId);
  res.json(result);
};
