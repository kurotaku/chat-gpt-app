
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (typeof req.query.id !== 'string') {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const id: number = parseInt(req.query.id, 10);

  switch (req.method) {
    case "GET":
      const child = await prisma.child.findMany({ where: { id: id } });
      res.status(200).json(child);
      break;
    case "DELETE":
      const deletedChild = await prisma.child.delete({ where: { id: id } });
      res.status(200).json(deletedChild);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
