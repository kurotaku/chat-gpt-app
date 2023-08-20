import { ChatCompletionRequestMessage } from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { openaiCompletion } from '../../../../utils/openai';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        console.log('body', req.body);

        const content = JSON.parse(req.body.content);
        const { domain, postType, targetDom, prompt } = content;

        if (!domain || !postType || !targetDom || !prompt) {
          throw new Error('Missing required fields in content');
        }

        const postId = req.body.current;
        if (!postId) {
          throw new Error('postId is missing in the request');
        }

        const wpUrl = `https://${domain}/wp-json/wp/v2/${postType}s/${postId}`;
        const credentials = process.env.WP_CREDENTIALS;
        const base64Credentials = Buffer.from(credentials).toString('base64');

        const response = await axios({
          method: 'get',
          url: wpUrl,
          headers: {
            Authorization: `Basic ${base64Credentials}`,
          },
        });

        const message: ChatCompletionRequestMessage[] = [
          {
            role: 'user',
            content:
              `${response?.data.meta.introduction}${response?.data.meta.purpose_text}${response?.data.meta.greeting}` +
              prompt,
          },
        ];

        const newContent = await openaiCompletion(null, message);
        console.log(newContent);

        const updateResponse = await axios({
          method: 'post',
          url: wpUrl,
          data: {
            content: newContent.data.choices[0].message.content,
            meta: response.data.meta,
          },
          headers: {
            Authorization: `Basic ${base64Credentials}`,
          },
        });

        console.log(updateResponse.data);
        res.status(200).json({ message: 'success!' });
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('APIエラー:', error.message);

    if (
      error.message.includes('Missing required fields in content') ||
      error.message.includes('postId is missing in the request')
    ) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error.response) {
      if (error.response.status === 404) {
        res.status(404).json({ message: 'WP APIエラー: Invalid domain or ID' });
      } else if (error.response.status >= 500) {
        res.status(500).json({ message: 'WP APIエラー: Server error' });
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
}
