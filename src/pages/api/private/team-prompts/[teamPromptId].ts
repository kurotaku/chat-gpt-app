import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const teamPromptId = Number(req.query.teamPromptId);

  switch (req.method) {
    case 'PUT':
      const { name, content } = req.body;
      const updateChat = await prisma.teamPrompt.update({
        where: { id: teamPromptId },
        data: { name, content },
      });
      res.status(200).json(updateChat);
      break;
    case 'DELETE':
      const deleteChat = await prisma.teamPrompt.delete({
        where: { id: teamPromptId },
      });
      res.status(204).json(deleteChat);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
