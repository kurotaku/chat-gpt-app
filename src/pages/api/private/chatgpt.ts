import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient, User, Team } from '@prisma/client';
import { openaiCompletion } from '../../../utils/openai';
import { getPrompts } from '../../../utils/prompts';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user: User & {team: Team} = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { team: true },
  });

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const totalPrompts = await getPrompts(user, req);

  const messagesArray = req.body.messages.map((data) => {
    return {
      role: data.role,
      content: data.content,
    };
  });

  try {
    const completion = await openaiCompletion(totalPrompts, messagesArray);
    res.status(200).json({
      ...completion.data,
      totalPrompts: { ...totalPrompts.map((prompt) => prompt.content) },
    });
    return;
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
