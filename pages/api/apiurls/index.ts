import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import prisma from '../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const apiUrls = await prisma.apiUrl.findMany();
        res.status(200).json(apiUrls);
        break;
      case 'POST':
        const apiUrl = await prisma.apiUrl.create({
          data: {
            name: req.body.name,
            url: req.body.url,
            method: req.body.method,
            header: req.body.header,
            body: req.body.body,
          },
        });
        res.status(200).json(apiUrl);
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
