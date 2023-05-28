import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { UserForToken } from '../../../../../../types/types';

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const subjectId = Number(req.query.subjectId);
  const chatId = Number(req.query.chatId);

  switch (req.method) {
    case 'PUT':
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new Error('No token provided');
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        const userFromToken: UserForToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        res.status(200).json({ content: 'This is protected content.', userFromToken });
      } catch (e) {
        res.status(403).json({ message: 'Access denied' });
      }
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
