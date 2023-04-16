import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  console.log(session);

  // if (!session) {
  //   res.status(401).json({ message: "Unauthorized" });
  //   return;
  // }

  // const userId = session.user.id;

  // // Read（読み取り）処理
  // const children = await prisma.child.findMany({ where: { userId } });
  // res.json(children);
}
