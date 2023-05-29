import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const chatId: number = Number(req.query.chatId);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  switch (req.method) {
    case 'GET':
      const messages = await prisma.message.findMany({
        where: { chatId: chatId },
        include: {
          user: {
            select: { name: true },
          },
        },
      });
      res.status(200).json(messages);
      break;
    case 'POST':
      const { role, content } = req.body;
      const message = await prisma.message.create({
        data: {
          role,
          content,
          chatId: chatId,
          userId: user.id,
        },
      });
      res.status(200).json(message);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
