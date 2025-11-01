import type { NextApiRequest, NextApiResponse } from 'next';
import { bills } from '../index';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid bill ID' });
  }

  const bill = bills.get(id);
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' });
  }

  const { paymentAmount, txHash } = req.body;
  
  if (!paymentAmount || !txHash) {
    return res.status(400).json({ error: 'Missing payment amount or transaction hash' });
  }

  // Update remaining amount
  const currentRemaining = BigInt(bill.remainingAmount);
  const payment = BigInt(paymentAmount);
  const newRemaining = currentRemaining > payment ? currentRemaining - payment : BigInt(0);
  
  bill.remainingAmount = newRemaining.toString();
  bills.set(id, bill);

  return res.status(200).json({
    success: true,
    bill,
    newRemainingAmount: bill.remainingAmount,
  });
}

