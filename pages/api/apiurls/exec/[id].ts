import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from "next-auth/next"
import axios from 'axios';
import prisma from '../../../../utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  const id = req.query.id as string;

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try{
    switch (req.method) {
      case "POST":
        const text = req.body.text;

        if (typeof text === 'undefined') {
          res.status(400).json({ message: '"text" parameter is required.' });
          return;
        }

        const apiUrl = await prisma.apiUrl.findMany({
          where: { id: parseInt(id) },
        });

        let header = {};
        try {
          header = JSON.parse(apiUrl[0].header);
        } catch (error) {
          console.log('Failed to parse headers:', error);
        }

        const param = {
          headers: header
        }        

        let replacedBody = apiUrl[0].body.replace('[text]', text);
        console.log('replacedBody', replacedBody);
        try {
          // エスケープされていない改行をエスケープ
          replacedBody = replacedBody.replace(/\n/g, "\\n");
          // JSON形式であればパースする
          replacedBody = JSON.parse(replacedBody);
        } catch (error) {
          // JSON形式でなければそのまま使用
          console.log(error);
        }
        console.log('replacedBody', replacedBody);

        try {
          const call = await axios.post(apiUrl[0].url, replacedBody, param);
          console.log('call', call);
        } catch (error) {
          console.log(error);
        }
        
        res.status(200).json(apiUrl);
        break;
      default:
        res.status(405).json({ message: "Method not allowed" });
        break;
    }
  } catch (error) {
    console.log('Error', error);
    res.status(500).json(error);
  }
  
}
export default handler;
