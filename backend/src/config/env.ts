import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me',
  RPC_URL: process.env.RPC_URL ?? 'http://127.0.0.1:8545',
  PRIVATE_KEY: process.env.PRIVATE_KEY ?? '',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ?? '',
};

if (!process.env.JWT_SECRET) {
  console.warn('[env] JWT_SECRET is not set. Using fallback value for development.');
}
