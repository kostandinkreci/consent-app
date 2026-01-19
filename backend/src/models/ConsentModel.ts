import db from '../config/db';

export type ConsentStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export type ConsentRecord = {
  id: string;
  initiatorId: number;
  partnerId: number | null;
  title: string;
  description: string;
  validFrom: string | null;
  validTo: string | null;
  status: ConsentStatus;
  blockchainId: string | null;
  txHash: string | null;
  joinCode: string | null;
  initiatorConfirmed: number;
  partnerConfirmed: number;
  createdAt: string | null;
  confirmedAt: string | null;
};

const insertConsentStmt = db.prepare(
  `INSERT INTO CONSENTS (id, initiatorId, partnerId, title, description, validFrom, validTo, status, blockchainId, txHash, joinCode, initiatorConfirmed, partnerConfirmed, createdAt, confirmedAt)
   VALUES (@id, @initiatorId, @partnerId, @title, @description, @validFrom, @validTo, @status, @blockchainId, @txHash, @joinCode, @initiatorConfirmed, @partnerConfirmed, @createdAt, @confirmedAt)`
);

const getConsentStmt = db.prepare<ConsentRecord>('SELECT * FROM CONSENTS WHERE id = ?');
const getConsentByJoinCodeStmt = db.prepare<ConsentRecord>('SELECT * FROM CONSENTS WHERE joinCode = ?');
const deleteConsentStmt = db.prepare('DELETE FROM CONSENTS WHERE id = ?');

export const createConsent = (record: ConsentRecord) => {
  insertConsentStmt.run(record);
  return record;
};

export const getConsentById = (id: string): ConsentRecord | undefined => getConsentStmt.get(id);

export const getConsentByJoinCode = (joinCode: string): ConsentRecord | undefined => getConsentByJoinCodeStmt.get(joinCode);

export const updateConsent = (id: string, updates: Partial<ConsentRecord>) => {
  const keys = Object.keys(updates) as (keyof ConsentRecord)[];
  if (!keys.length) return getConsentById(id);

  const setClause = keys.map((key) => `${key} = @${key}`).join(', ');
  const stmt = db.prepare(`UPDATE CONSENTS SET ${setClause} WHERE id = @id`);
  stmt.run({ id, ...updates });
  return getConsentById(id);
};

export const deleteConsent = (id: string) => {
  deleteConsentStmt.run(id);
};

export const listConsentsForUser = (userId: number) => {
  const stmt = db.prepare(`
    SELECT c.*, 
           initiator.email AS initiatorEmail,
           partner.email AS partnerEmail
    FROM CONSENTS c
    LEFT JOIN USERS initiator ON initiator.id = c.initiatorId
    LEFT JOIN USERS partner ON partner.id = c.partnerId
    WHERE c.initiatorId = @userId OR c.partnerId = @userId
    ORDER BY c.rowid DESC
  `);

  return stmt.all({ userId });
};
