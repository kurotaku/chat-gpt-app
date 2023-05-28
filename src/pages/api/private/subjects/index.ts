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
      const subjects = await prisma.subject.findMany();
      res.status(200).json(subjects);
      break;
    case 'POST':
      const { name } = req.body;
      const subject = await prisma.subject.create({
        data: {
          name,
        },
      });
      res.status(200).json(subject);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
