import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('=========== Creating Users ===========');

  await prisma.user.create({
    data: {
      name: 'テストユーザー',
      email: 'test@test.com',
      password: bcrypt.hashSync('password', 10),
    },
  });

  for (let i = 0; i < 10; i++) {
    faker.locale = 'ja';
    const familyName = faker.name.lastName();
    const firstName = faker.name.firstName();
    const name = familyName + ' ' + firstName;

    faker.locale = 'en';
    const engName = faker.name.fullName().toLowerCase();
    const email = faker.internet.email(engName);
    const password = bcrypt.hashSync('password', 10);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: password,
      },
    });
  }

  // console.log('=========== Creating GlobalPrompts ===========');
  // await prisma.globalPrompt.create({
  //   data: {
  //     content: `
  //     語尾は「にゃん」でお願いします。
  //     `
  //   },
  // });

  console.log('=========== API URLs ===========');
  await prisma.apiUrl.create({
    data: {
      name: 'slackbotで送って',
      url: process.env.SLACK_WEBHOOK_URL,
      method: 'POST',
      header: `{
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }`,
      body: `payload={ "text": "[text]"}`,
    },
  });

  await prisma.apiUrl.create({
    data: {
      name: 'slackに送って',
      url: 'https://slack.com/api/chat.postMessage',
      method: 'POST',
      header: `{ "Authorization": "Bearer ${process.env.SLACK_TOKEN}"}`,
      body: `{"channel":"#neconote","text":"[text]"}`,
    },
  });

  console.log('=========== Subject ===========');
  const subject1 = await prisma.subject.create({
    data: {
      name: '太郎さん',
    },
  });

  console.log('=========== SubjectPrompt ===========');
  await prisma.subjectPrompt.create({
    data: {
      subject: {
        connect: {
          id: subject1.id,
        },
      },
      name: '太郎さんのプロフィール',
      content: `太郎さんは30歳の男性で、ソフトウェアエンジニアの仕事をしています。
休日は土日祝日で、趣味は犬の散歩です。`,
    },
  });
  await prisma.subjectPrompt.create({
    data: {
      subject: {
        connect: {
          id: subject1.id,
        },
      },
      name: '太郎さんの好きな食べ物',
      content: `太郎さんの好きな食べ物は、ケーキやアイスなどの甘いものです。`,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
