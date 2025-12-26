import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { dataSource } from '../../database/data-source';
import { User } from '../../users/user.entity';
import { normalizeText } from '../../common/text.utils';

const TEN_MINUTES = 60 * 1000 * 10;

const handleLoginRateLimit = async (req: Request, res: Response) => {
  const userRepository = dataSource.getRepository(User);
  const { email } = req.body;

  const normalizedEmail = normalizeText(email);
  const user = await userRepository.findOne({
    where: { email: normalizedEmail },
  });

  if (user && !user.locked) {
    await userRepository.update(user.id, { locked: true });
  }
  // Do not reveal if the user exists or not
  res.status(429).send('Incorrect username or password');
};

export const loginRateLimiter = rateLimit({
  handler: handleLoginRateLimit,
  windowMs: TEN_MINUTES,
  limit: 5,
});
