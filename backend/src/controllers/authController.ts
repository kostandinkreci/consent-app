import { Request, Response } from 'express';

import { createUser, getUserByEmail } from '../models/UserModel';
import { hashPassword, comparePassword } from '../utils/crypto';
import { signToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  const { email, password, walletAddress } = req.body as {
    email?: string;
    password?: string;
    walletAddress?: string;
  };

  if (!email || !password || !walletAddress) {
    return res.status(400).json({ message: 'email, password and walletAddress are required' });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(email, passwordHash, walletAddress);
  const token = signToken({ userId: user.id, email: user.email });

  return res.status(201).json({ token, user: { id: user.id, email: user.email, walletAddress: user.walletAddress } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return res.json({ token, user: { id: user.id, email: user.email, walletAddress: user.walletAddress } });
};
