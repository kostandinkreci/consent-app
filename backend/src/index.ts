import cors from 'cors';
import express from 'express';

import authRoutes from './routes/authRoutes';
import consentRoutes from './routes/consentRoutes';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/consents', consentRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`Consent backend listening on port ${env.PORT}`);
});
