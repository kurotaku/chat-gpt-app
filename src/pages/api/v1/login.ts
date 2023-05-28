import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, User } from '@prisma/client';
import { UserForToken } from '../../../types/types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = JSON.parse(req.body);

    const user: User = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const userForToken: UserForToken = {
      id: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(userForToken, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = jwt.sign(userForToken, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly`);
    res.status(200).json({ accessToken });
  } else {
    res.status(405).json({ message: 'We only accept POST' });
  }
}
