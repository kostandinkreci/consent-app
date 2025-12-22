import db from '../config/db';

export type UserRecord = {
  id: number;
  email: string;
  passwordHash: string;
  walletAddress: string;
};

const insertUserStmt = db.prepare(
  `INSERT INTO USERS (email, passwordHash, walletAddress) VALUES (@email, @passwordHash, @walletAddress)`
);

const getUserByEmailStmt = db.prepare<UserRecord>('SELECT * FROM USERS WHERE email = ?');
const getUserByIdStmt = db.prepare<UserRecord>('SELECT * FROM USERS WHERE id = ?');

export const createUser = (email: string, passwordHash: string, walletAddress: string): UserRecord => {
  const result = insertUserStmt.run({ email, passwordHash, walletAddress });
  return {
    id: Number(result.lastInsertRowid),
    email,
    passwordHash,
    walletAddress,
  };
};

export const getUserByEmail = (email: string): UserRecord | undefined => getUserByEmailStmt.get(email);

export const getUserById = (id: number): UserRecord | undefined => getUserByIdStmt.get(id);
