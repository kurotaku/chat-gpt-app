import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from "openai";
import prisma from '../../utils/prisma';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const globalPrompts = await prisma.globalPrompt.findMany();
  const globalPromptsArray = globalPrompts.map(prompt => {
    return {
      role: 'system',
      content: prompt.content,
    };
  });

  let subjectPromptsArray = [];
  if(req.body.subjectId){
    const subjectPrompts = await prisma.subjectPrompt.findMany({
      where: { subjectId: req.body.subjectId },
    });
    subjectPromptsArray = subjectPrompts.map(subjectPrompt => {
      return {
        role: 'system',
        content: subjectPrompt.content,
      };
    });
  }

  const messagesArray = req.body.messages.map(data => {
    return {
      role: data.role,
      content: data.content,
    };
  });
  
  try{
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      // model: "gpt-3.5-turbo",
      messages: [
        ...globalPromptsArray,
        ...subjectPromptsArray,
        ...messagesArray
      ],
    });

    res.status(200).json(completion.data);
  }catch (error) {
    res.status(500).json(error);
  }
};

export default handler;