import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import prisma from '../../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const userId = Number(req.query.userId);

  switch (req.method) {
    case 'GET':
      const getUser = await prisma.user.findMany({
        where: { id: userId },
        include: { team: true },
      });
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
};

export default handler;
