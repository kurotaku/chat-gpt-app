import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from "next-auth/next"
import prisma from '../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  try{
    switch (req.method) {
      case "GET":
        const chats = await prisma.chat.findMany();
        res.status(200).json(chats);
        break;
      case "POST":
        const chat = await prisma.chat.create({
          data: {
            name: req.body.name,
            ...(req.body.subjectId && {
              subject: {
                connect: {
                  id: req.body.subjectId,
                },
              },
            }),
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        res.status(200).json(chat);
        break;
      default:
        res.status(405).json({ message: "Method not allowed" });
        break;
    }
  } catch (error) {
    console.log('Error', error);
    res.status(500).json(error);
  }
  
}
export default handler;
