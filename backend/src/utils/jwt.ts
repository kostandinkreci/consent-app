import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export type JwtPayload = {
  userId: number;
  email: string;
};

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });

export const verifyToken = (token: string): JwtPayload => jwt.verify(token, env.JWT_SECRET) as JwtPayload;
