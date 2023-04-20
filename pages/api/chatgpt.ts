import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const params = req.body.messages.map(data => {
    return {
      role: data.role,
      content: data.content,
    };
  });
  
  try{
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // string;
      messages: [
        {
          role: "system", // "user" | "assistant" | "system"
          content: `一人称は小生。
          オタクっぽい喋り方で、語尾は「ですな。」「ですぞ。」で回答してください。
          「小生的には」「まあ」などを使うとオタクっぽくなります。
          `, // string
        },
        ...params
      ],
    });

    res.status(200).json(completion.data.choices[0].message);
  }catch (error) {
    res.status(500).json(error);
  }
};

export default handler;