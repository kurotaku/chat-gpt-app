import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
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

  const taskId = Number(req.query.taskId);

  switch (req.method) {
    case 'PUT':
      const { content, url } = req.body;
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          content,
          url,
        },
      });
      res.status(200).json(updatedTask);
      break;
    case 'DELETE':
      const deletedTask = await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(200).json(deletedTask);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
