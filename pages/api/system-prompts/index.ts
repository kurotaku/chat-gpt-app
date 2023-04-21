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
        const systemPrompts = await prisma.systemPrompt.findMany();
        res.status(200).json(systemPrompts);
        break;
      case "POST":
        const systemPrompt = await prisma.systemPrompt.create({
          data: {
            content: req.body.content,
          },
        });
        res.status(200).json(systemPrompt);
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
