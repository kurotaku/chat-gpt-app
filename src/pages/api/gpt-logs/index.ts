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

  switch (req.method) {
    case 'GET':
      const logs = await prisma.gptLog.findMany({
        where: { userId: user.id },
      });
      res.status(200).json(logs);
      break;
    case 'POST':
      const { gptModel, promptTokens, completionTokens, totalTokens, prompt, response, totalPrompts } = req.body;
      const log = await prisma.gptLog.create({
        data: {
          gptModel,
          promptTokens,
          completionTokens,
          totalTokens,
          prompt,
          response,
          totalPrompts,
          userId: user.id,
        },
      });
      res.status(200).json(log);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
