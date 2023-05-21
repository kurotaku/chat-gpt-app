import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const apiUrlId = Number(req.query.apiUrlId);

  switch (req.method) {
    case 'PUT':
      const { name, url, method, header, body } = req.body;
      const updateApiUrl = await prisma.apiUrl.update({
        where: { id: apiUrlId },
        data: { name, url, method, header, body },
      });
      res.status(200).json(updateApiUrl);
      break;
    case 'DELETE':
      const deleteApiUrl = await prisma.apiUrl.delete({
        where: { id: apiUrlId },
      });
      res.status(204).json(deleteApiUrl);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
