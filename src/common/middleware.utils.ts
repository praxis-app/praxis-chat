import { NextFunction, Request, RequestHandler, Response } from 'express';

export const withMiddleware =
  (...middlewares: RequestHandler[]): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const runNext = async (): Promise<void> => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];

      try {
        await middleware(req, res, runNext);
      } catch (error) {
        next(error);
      }
    };

    await runNext();
  };
