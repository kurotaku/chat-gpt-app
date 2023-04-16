import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient()

async function main() {
  // User
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

  faker.locale = "ja";
  // Children
  for (let i = 0; i < 10; i++) {
    const familyName = faker.name.lastName();
    const firstName = faker.name.firstName();
    const name = familyName + ' ' + firstName;
    await prisma.child.create({
      data: {
        name: name,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

