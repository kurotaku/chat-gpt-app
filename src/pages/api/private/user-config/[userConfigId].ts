import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const userConfigId = Number(req.query.userConfigId);

  switch (req.method) {
    case 'PUT':
      const { teamLabel, subjectLabel } = req.body;
      const updatedUserConfig = await prisma.userConfig.update({
        where: { id: userConfigId },
        data: {
          teamLabel,
          subjectLabel,
        },
      });
      res.status(200).json(updatedUserConfig);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
