import type { NextApiRequest, NextApiResponse } from 'next';
import { bills } from './index';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid bill ID' });
  }

  if (req.method === 'GET') {
    const bill = bills.get(id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    return res.status(200).json(bill);
  } else if (req.method === 'PATCH') {
    // Update bill (e.g., reduce remaining amount)
    const bill = bills.get(id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const { remainingAmount } = req.body;
    if (remainingAmount !== undefined) {
      bill.remainingAmount = remainingAmount;
      bills.set(id, bill);
    }

    return res.status(200).json(bill);
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

