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

  try{
    switch (req.method) {
      case "GET":
        const subjectPrompts = await prisma.subjectPrompt.findMany({
          where: {
            subjectId: Number(req.query.subjectId)
          }}
        );
        res.status(200).json(subjectPrompts);
        break;
      case "POST":
        const subjectPrompt = await prisma.subjectPrompt.create({
          data: {
            subject: {
              connect: {
                id: Number(req.body.subjectId)
              },
            },
            name: req.body.name,
            content: req.body.content,
          },
        });
        res.status(200).json(subjectPrompt);
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
