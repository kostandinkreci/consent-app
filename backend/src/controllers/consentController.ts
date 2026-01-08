import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import {
  ConsentRecord,
  ConsentStatus,
  createConsent,
  getConsentById,
  getConsentByJoinCode,
  listConsentsForUser,
  updateConsent,
} from '../models/ConsentModel';
import { getUserByEmail, getUserById } from '../models/UserModel';
import { createConsentOnChain, revokeConsentOnChain } from '../blockchain/contract';

const normalizeJoinCode = (input: string) => {
  const alphanumeric = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (alphanumeric.length === 32) {
    const segments = [
      alphanumeric.slice(0, 8),
      alphanumeric.slice(8, 12),
      alphanumeric.slice(12, 16),
      alphanumeric.slice(16, 20),
      alphanumeric.slice(20),
    ];
    return segments.join('-');
  }
  return input.trim().toLowerCase();
};

const serializeConsent = (consent: ConsentRecord & { initiatorEmail?: string; partnerEmail?: string }) => ({
  id: consent.id,
  title: consent.title,
  description: consent.description,
  status: consent.status,
  validFrom: consent.validFrom,
  validTo: consent.validTo,
  blockchainId: consent.blockchainId,
  txHash: consent.txHash,
  joinCode: consent.joinCode,
  initiatorId: consent.initiatorId,
  partnerId: consent.partnerId,
  initiatorConfirmed: Boolean(consent.initiatorConfirmed),
  partnerConfirmed: Boolean(consent.partnerConfirmed),
  initiatorEmail: consent.initiatorEmail,
  partnerEmail: consent.partnerEmail,
  createdAt: consent.createdAt,
  confirmedAt: consent.confirmedAt,
});

export const createConsentSession = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { title, description, validFrom, validTo, partnerEmail } = req.body as {
    title?: string;
    description?: string;
    validFrom?: string;
    validTo?: string;
    partnerEmail?: string;
  };

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const consentId = uuid();
  const joinCode = normalizeJoinCode(uuid());
  const partner = partnerEmail ? getUserByEmail(partnerEmail) : undefined;

  const consent: ConsentRecord = {
    id: consentId,
    initiatorId: userId,
    partnerId: partner?.id ?? null,
    title,
    description,
    validFrom: validFrom ?? null,
    validTo: validTo ?? null,
    status: 'PENDING',
    blockchainId: null,
    txHash: null,
    joinCode: partner ? null : joinCode,
    initiatorConfirmed: 0,
    partnerConfirmed: 0,
    createdAt: new Date().toISOString(),
    confirmedAt: null,
  };

  const created = createConsent(consent);
  return res.status(201).json(serializeConsent({ ...created, partnerEmail: partner?.email }));
};

export const joinConsentSession = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { joinCode } = req.body as { joinCode?: string };
  if (!joinCode) {
    return res.status(400).json({ message: 'joinCode is required' });
  }

  const normalizedJoinCode = normalizeJoinCode(joinCode);
  const consent = getConsentByJoinCode(normalizedJoinCode);
  if (!consent) {
    return res.status(404).json({ message: 'Invalid join code' });
  }

  if (consent.initiatorId === userId) {
    return res.status(400).json({ message: 'Initiator cannot join their own consent' });
  }

  if (consent.partnerId) {
    return res.status(400).json({ message: 'Consent already has a partner' });
  }

  const updated = updateConsent(consent.id, { partnerId: userId, joinCode: null });
  return res.json(serializeConsent(updated!));
};

export const confirmConsent = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { consentId } = req.body as { consentId?: string };
  if (!consentId) return res.status(400).json({ message: 'consentId is required' });

  const consent = getConsentById(consentId);
  if (!consent) return res.status(404).json({ message: 'Consent not found' });

  if (consent.initiatorId !== userId && consent.partnerId !== userId) {
    return res.status(403).json({ message: 'Not part of this consent' });
  }

  const updates: Partial<ConsentRecord> = {};
  if (consent.initiatorId === userId) {
    updates.initiatorConfirmed = 1;
  } else if (consent.partnerId === userId) {
    updates.partnerConfirmed = 1;
  }

  let updated = updateConsent(consent.id, updates);

  if (
    updated &&
    updated.initiatorConfirmed &&
    updated.partnerConfirmed &&
    updated.status !== 'ACTIVE' &&
    updated.partnerId
  ) {
    const initiator = getUserById(updated.initiatorId);
    const partner = getUserById(updated.partnerId);

    if (!initiator || !partner) {
      return res.status(500).json({ message: 'Consent participants missing' });
    }

    try {
      const tx = await createConsentOnChain(updated.id, initiator.walletAddress, partner.walletAddress);
      updated = updateConsent(updated.id, {
        status: 'ACTIVE',
        blockchainId: updated.id,
        txHash: tx.hash,
        confirmedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('On-chain consent failed', error);
      return res.status(500).json({ message: 'Blockchain transaction failed' });
    }
  }

  return res.json(serializeConsent(updated!));
};

export const revokeConsent = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { consentId } = req.body as { consentId?: string };
  if (!consentId) return res.status(400).json({ message: 'consentId is required' });

  const consent = getConsentById(consentId);
  if (!consent) return res.status(404).json({ message: 'Consent not found' });

  if (consent.initiatorId !== userId && consent.partnerId !== userId) {
    return res.status(403).json({ message: 'Not part of this consent' });
  }

  if (consent.status === 'REVOKED') {
    return res.status(400).json({ message: 'Consent already revoked' });
  }

  if (consent.blockchainId) {
    try {
      const tx = await revokeConsentOnChain(consent.blockchainId);
      updateConsent(consent.id, { txHash: tx.hash });
    } catch (error) {
      console.error('Blockchain revoke failed', error);
      return res.status(500).json({ message: 'Blockchain transaction failed' });
    }
  }

  const updated = updateConsent(consent.id, { status: 'REVOKED' });
  return res.json(serializeConsent(updated!));
};

export const listConsents = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const consents = listConsentsForUser(userId).map(serializeConsent);
  return res.json(consents);
};

export const getConsent = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;
  const consent = getConsentById(id);
  if (!consent) return res.status(404).json({ message: 'Consent not found' });

  if (consent.initiatorId !== userId && consent.partnerId !== userId) {
    return res.status(403).json({ message: 'Not part of this consent' });
  }

  return res.json(serializeConsent(consent));
};
