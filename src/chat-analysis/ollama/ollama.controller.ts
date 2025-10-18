import { Request, Response } from 'express';
import * as ollamaService from './ollama.service';

export const getOllamaHealth = async (_: Request, res: Response) => {
  const payload = await ollamaService.getOllamaHealth();
  res.json({ message: payload });
};
