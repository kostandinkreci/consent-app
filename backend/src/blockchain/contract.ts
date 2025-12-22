import { Contract, JsonRpcProvider, Wallet, ethers } from 'ethers';

import { env } from '../config/env';

const ABI = [
  'function createConsent(bytes32 id, address partyA, address partyB) public returns (bool)',
  'function revokeConsent(bytes32 id) public returns (bool)',
];

const getContract = (): Contract => {
  if (!env.PRIVATE_KEY || !env.CONTRACT_ADDRESS) {
    throw new Error('Blockchain configuration missing');
  }
  const provider = new JsonRpcProvider(env.RPC_URL);
  const wallet = new Wallet(env.PRIVATE_KEY, provider);
  return new Contract(env.CONTRACT_ADDRESS, ABI, wallet);
};

const toBytes32 = (consentId: string) => ethers.id(consentId);

export const createConsentOnChain = async (consentId: string, partyA: string, partyB: string) => {
  const contract = getContract();
  const tx = await contract.createConsent(toBytes32(consentId), partyA, partyB);
  return tx.wait();
};

export const revokeConsentOnChain = async (consentId: string) => {
  const contract = getContract();
  const tx = await contract.revokeConsent(toBytes32(consentId));
  return tx.wait();
};
