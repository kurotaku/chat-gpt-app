import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest } from 'next';

const prisma = new PrismaClient();

export async function getPrompts(user: User, req: NextApiRequest) {
  const globalPrompts = await prisma.globalPrompt.findMany();
  const globalPromptsArray = globalPrompts.map((prompt) => {
    return {
      role: 'system',
      content: prompt.content,
    };
  });

  const teamPrompts = await prisma.teamPrompt.findMany({
    where: { teamId: user.teamId },
  });
  const teamPromptsArray = teamPrompts.map((prompt) => {
    return {
      role: 'system',
      content: prompt.content,
    };
  });

  const userPrompts = await prisma.userPrompt.findMany({
    where: { teamId: user.teamId },
  });
  const userPromptsArray = userPrompts.map((prompt) => {
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

  return [...globalPromptsArray, ...teamPromptsArray, ...userPromptsArray, ...subjectPromptsArray];
}
