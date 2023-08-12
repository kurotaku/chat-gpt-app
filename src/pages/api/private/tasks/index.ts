import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  switch (req.method) {
    case 'GET':
      const tasks = await prisma.task.findMany();
      res.status(200).json(tasks);
      break;
    case 'POST':
      const { name, defaultUrl, defaultContent } = req.body;
      const task = await prisma.task.create({
        data: {
          name,
          defaultUrl,
          defaultContent,
        },
      });
      res.status(200).json(task);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
