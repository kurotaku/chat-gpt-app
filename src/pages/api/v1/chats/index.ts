import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Chat } from '@prisma/client';
import { UserForToken } from '../../../../types/types';
import { openaiCompletion } from '../../../../utils/openai';
import { getPrompts } from '../../../../utils/prompts';

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method) {
    case 'POST':
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new Error('No token provided');
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        const userFromToken: UserForToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        const user: User = await prisma.user.findUnique({
          where: { email: userFromToken.email },
        });

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

        // TODO 書き込みもできるように
        // const response = {
        //   chat: {}
        // };

        // try{
        //   const chat: Chat = await prisma.chat.create({
        //     data: {
        //       name: req.body.messages[0].slice(0, 100),
        //       team: {
        //         connect: {
        //           id: user.teamId,
        //         },
        //       },
        //       ...(req.body.subjectId && {
        //         subject: {
        //           connect: {
        //             id: req.body.subjectId,
        //           },
        //         },
        //       }),
        //       user: {
        //         connect: {
        //           id: user.id,
        //         },
        //       },
        //     },
        //   });
        //   response.chat = chat;
        // } catch (error) {
        //   res.status(403).json({ error });
        //   return
        // }

        // res.status(200).json({ message: 'SUCCESS!', response });
      } catch (e) {
        res.status(403).json({ message: 'Access denied' });
      }
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
