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

  const chatId: number = Number(req.query.chatId);

  switch (req.method) {
    case 'GET':
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      res.status(200).json(chat);
      break;
    case 'PUT':
      const { name } = req.body;
      const updateChat = await prisma.chat.update({
        where: { id: chatId },
        data: { name },
      });
      res.status(200).json(updateChat);
      break;
    case 'DELETE':
      const deleteChat = await prisma.chat.delete({
        where: { id: chatId },
      });
      res.status(204).json(deleteChat);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
