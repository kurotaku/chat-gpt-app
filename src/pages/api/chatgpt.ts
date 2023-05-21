import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient, User, Team } from '@prisma/client';

const prisma = new PrismaClient();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    // If there is no session, respond with a 401 status and a message
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { team: true },
  });

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const globalPrompts = await prisma.globalPrompt.findMany();
  const globalPromptsArray = globalPrompts.map((prompt) => {
    return {
      role: 'system',
      content: prompt.content,
    };
  });

  let subjectPromptsArray = [];
  if (req.body.subjectId) {
    const subjectPrompts = await prisma.subjectPrompt.findMany({
      where: { subjectId: req.body.subjectId },
    });
    subjectPromptsArray = subjectPrompts.map((subjectPrompt) => {
      return {
        role: 'system',
        content: subjectPrompt.content,
      };
    });
  }

  const messagesArray = req.body.messages.map((data) => {
    return {
      role: data.role,
      content: data.content,
    };
  });

  try {
    const completion = await openai.createChatCompletion({
      // model: 'gpt-4',
      model: 'gpt-3.5-turbo',
      messages: [...globalPromptsArray, ...subjectPromptsArray, ...messagesArray],
    });

    res.status(200).json(completion.data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
