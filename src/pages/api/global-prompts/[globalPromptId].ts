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

  const globalPromptId = Number(req.query.globalPromptId);

  switch (req.method) {
    case 'PUT':
      const { content } = req.body;
      const updateChat = await prisma.globalPrompt.update({
        where: { id: globalPromptId },
        data: { content },
      });
      res.status(200).json(updateChat);
      break;
    case 'DELETE':
      const deleteChat = await prisma.globalPrompt.delete({
        where: { id: globalPromptId },
      });
      res.status(204).json(deleteChat);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
