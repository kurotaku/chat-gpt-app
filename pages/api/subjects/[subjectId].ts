import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const subjectId = Number(req.query.subjectId);

  switch (req.method) {
    case 'PUT':
      const { name } = req.body;
      const updatedSubject = await prisma.subject.update({
        where: { id: subjectId },
        data: {
          name,
        },
      });
      res.status(200).json(updatedSubject);
      break;
    case 'DELETE':
      const deletedSubject = await prisma.subject.delete({
        where: { id: subjectId },
      });
      res.status(200).json(deletedSubject);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
