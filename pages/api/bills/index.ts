import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export interface Bill {
  id: string;
  merchantAddress: string;
  merchantChainId: string;
  totalAmount: string; // Amount in USDC (6 decimals)
  remainingAmount: string;
  createdAt: string;
}

// In-memory store for bills (in production, use a database)
export const bills: Map<string, Bill> = new Map();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Create a new bill
    const { merchantAddress, merchantChainId, totalAmount } = req.body;
    
    if (!merchantAddress || !merchantChainId || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bill: Bill = {
      id: uuidv4(),
      merchantAddress,
      merchantChainId,
      totalAmount,
      remainingAmount: totalAmount,
      createdAt: new Date().toISOString(),
    };

    bills.set(bill.id, bill);
    return res.status(201).json(bill);
  } else if (req.method === 'GET') {
    // Get all bills (for development) or get by ID
    const { id } = req.query;
    
    if (id && typeof id === 'string') {
      const bill = bills.get(id);
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      return res.status(200).json(bill);
    }

    return res.status(200).json(Array.from(bills.values()));
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

