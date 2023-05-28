import { NextApiRequest, NextApiResponse } from 'next';

export default function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', `refreshToken=; HttpOnly; Max-Age=0`);
    res.status(204).end();
  } else {
    res.status(405).json({ message: 'We only accept POST' });
  }
}
