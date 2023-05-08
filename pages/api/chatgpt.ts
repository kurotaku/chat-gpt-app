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

  const systemPrompts = await prisma.systemPrompt.findMany();
  const systemPromptsArray = systemPrompts.map(prompt => {
    return {
      role: 'system',
      content: prompt.content,
    };
  });

  let topicsArray = [];
  if(req.body.subjectId){
    const topics = await prisma.topic.findMany({
      where: { subjectId: req.body.subjectId },
    });
    topicsArray = topics.map(topic => {
      return {
        role: 'system',
        content: topic.content,
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
      model: "gpt-3.5-turbo", // string;
      messages: [
        ...systemPromptsArray,
        ...topicsArray,
        ...messagesArray
      ],
    });

    res.status(200).json(completion.data);
  }catch (error) {
    res.status(500).json(error);
  }
};

export default handler;