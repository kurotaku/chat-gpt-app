import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { PrismaClient, User } from '@prisma/client';
import { UserForToken } from '../../../types/types';

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export default async function refresh(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const userFromToken: UserForToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      const user: User = await prisma.user.findUnique({
        where: {
          id: userFromToken.id,
        },
      });

      const userForToken: UserForToken = {
        id: user.id,
        email: user.email,
      };

      const accessToken = jwt.sign(userForToken, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      });
      const newRefreshToken = jwt.sign(userForToken, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      });

      res.setHeader('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly`);
      res.status(200).json({ accessToken });
    } catch (e) {
      console.log(e);
      res.status(403).json({ message: 'Invalid refresh token' });
    }
  } else {
    res.status(405).json({ message: 'We only accept POST' });
  }
}
