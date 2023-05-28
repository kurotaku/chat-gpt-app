import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json({ message: 'GET SUCCESS!' });
      break;
    case 'POST':
      res.status(200).json({ message: 'SUCCESS!' });
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
