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

  switch (req.method) {
    case "GET":
      const children = await prisma.child.findMany();
      res.status(200).json(children);
      break;
    case "POST":
      const createdChild = await prisma.child.create({data: {...req.body, updatedAt: new Date()}})
      res.status(200).send(createdChild);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
