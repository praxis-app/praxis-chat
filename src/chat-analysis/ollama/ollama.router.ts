import express from 'express';
import { getOllamaHealth } from './ollama.controller';

export const ollamaRouter = express.Router();

ollamaRouter.get('/health', getOllamaHealth);
