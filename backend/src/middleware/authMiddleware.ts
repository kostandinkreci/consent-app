import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.replace('Bearer ', '');

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (error) {
    console.error('authMiddleware error', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
