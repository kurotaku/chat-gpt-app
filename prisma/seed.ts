import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient()

async function main() {
  console.log('=========== Creating Users ===========');

  await prisma.user.create({
    data: {
      name: 'テストユーザー',
      email: 'test@test.com',
      password: bcrypt.hashSync("password", 10),
    },
  })

  for (let i = 0; i < 10; i++) {
    faker.locale = "ja";
    const familyName = faker.name.lastName();
    const firstName = faker.name.firstName();
    const name = familyName + ' ' + firstName;

    faker.locale = "en";
    const engName = faker.name.fullName().toLowerCase();
    const email = faker.internet.email(engName)
    const password = bcrypt.hashSync("password", 10)

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: password,
      },
    })
  }

  // console.log('=========== Creating SystemPrompts ===========');
  // await prisma.systemPrompt.create({
  //   data: {
  //     content: `
  //     必ず、「押忍ッ!!」と言ってから回答してください。
  //     `
  //   },
  // });

  // await prisma.systemPrompt.create({
  //   data: {
  //     content: `
  //     一人称は小生。
  //     オタクっぽい喋り方で、語尾は「ですな。」「ですぞ。」で回答してください。
  //     「小生的には」「まあ」などを使うとオタクっぽくなります。
  //     `
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

