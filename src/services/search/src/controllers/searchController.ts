import { Request, Response } from 'express';
import { search } from '../services/searchService';

export const searchHandler = (req: Request, res: Response) => {
  const query = req.query.q as string;
  const strategy = (req.query.strategy as string) || 'default';

  if (!query) {
    return res.status(400).json({ message: 'Missing query parameter "q"' });
  }

  const result = search(query, strategy as 'default' | 'regex');
  res.json(result);
};
