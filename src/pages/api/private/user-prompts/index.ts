import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import prisma from '../../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  try {
    switch (req.method) {
      case 'GET':
        const userPrompts = await prisma.userPrompt.findMany({
          where: {
            teamId: Number(req.query.teamId || req.body.teamId),
          },
        });
        res.status(200).json(userPrompts);
        break;
      case 'POST':
        const userPrompt = await prisma.userPrompt.create({
          data: {
            team: {
              connect: {
                id: user.teamId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            name: req.body.name,
            content: req.body.content,
          },
        });
        res.status(200).json(userPrompt);
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.log('Error', error);
    res.status(500).json(error);
  }
};
export default handler;
