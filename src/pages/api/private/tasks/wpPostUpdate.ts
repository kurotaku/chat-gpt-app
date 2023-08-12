import { ChatCompletionRequestMessage } from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';
import { openaiCompletion } from '../../../../utils/openai';
const prisma = new PrismaClient();

const fetchPageContent = async (url: string): Promise<string> => {
  const { data } = await axios.get(url);
  return data;
};

const extractContent = (html: string, selector: string): string => {
  const $ = cheerio.load(html);
  const caseContent = $('#caseContent').html();
  return caseContent;
};

const extractBodyClass = (html: string): string | null => {
  const $ = cheerio.load(html);
  const bodyClass = $('body').attr('class');
  const postIdRegex = /postid-(\d+)/;
  const match = bodyClass.match(postIdRegex);
  if (match) {
    return match[1]; // 抽出された数字部分
  }
  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  switch (req.method) {
    case 'POST':
      console.log('body', req.body);

      let domain: string;
      let postType: string;
      let targetDom: string;
      let prompt: string;
      let postSlug: string;

      try {
        const content = JSON.parse(req.body.content);
        domain = content.domain;
        if (!domain) {
          throw new Error('domain is missing in the content');
        }

        postType = content.postType;
        if (!postType) {
          throw new Error('postType is missing in the content');
        }

        targetDom = content.targetDom;
        if (!targetDom) {
          throw new Error('targetDom is missing in the content');
        }

        prompt = content.prompt;
        if (!prompt) {
          throw new Error('prompt is missing in the content');
        }

        postSlug = req.body.current;
        if (!postSlug) {
          throw new Error('postId is missing in the content');
        }
      } catch (error) {
        console.error('JSONの書式が正しくありません:', error.message);
      }

      const getUrl = `https://${domain}/${postType}/${postSlug}/`;
      console.log(getUrl);
      let pageContent: string;
      let targetContent: string;
      let postId: string;

      try {
        pageContent = await fetchPageContent(getUrl);
      } catch (error) {
        console.error('URLが正しくありません:', error.message);
      }

      try {
        targetContent = extractContent(pageContent, targetDom);
      } catch (error) {
        console.error('対象のDomがないようです:', error.message);
      }

      try {
        postId = extractBodyClass(pageContent);
      } catch (error) {
        console.error('bodyのクラスの取得ができませんでした:', error.message);
      }

      const message: ChatCompletionRequestMessage[] = [
        {
          role: 'user',
          content: targetContent + prompt,
        },
      ];

      let newContent;

      try {
        newContent = await openaiCompletion(null, message);
        console.log(newContent);
      } catch (error) {
        console.error('APIエラー:', error.message);
      }

      console.log('これです', newContent.data.choices[0]);

      const wpUrl = `https://${domain}/wp-json/wp/v2/${postType}s/${postId}`;

      const getPostData = async (wpUrl: string, credentials: string): Promise<any> => {
        const response = await axios({
          method: 'get',
          url: wpUrl,
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });

        return response.data;
      };

      console.log('wpUrl', wpUrl);

      const credentials = process.env.WP_CREDENTIALS;
      const base64Credentials = Buffer.from(credentials).toString('base64');

      const currentPostData = await getPostData(wpUrl, base64Credentials);

      const response = await axios({
        method: 'post',
        url: wpUrl,
        data: {
          content: newContent.data.choices[0].message.content,
          meta: currentPostData.meta,
        },
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      });

      const data = response.data;
      console.log(data);

      res.status(200).json({ message: 'success!' });
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}
