import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from "next-auth/next"
import prisma from '../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the current session from the request
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    // If there is no session, respond with a 401 status and a message
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // If there is a session, find the user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    // If the user is not found, respond with a 404 status and a message
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // If everything is fine, respond with a 200 status and the user data
  res.status(200).json(user);
};

export default handler;
