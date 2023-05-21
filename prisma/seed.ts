import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('=========== Creating GlobalPrompts ===========');
  await prisma.globalPrompt.create({
    data: {
      content: `
      語尾は「わん」でお願いします。
      `
    },
  });

  console.log('=========== Creating Teams ===========');
  const testTeam = await prisma.team.create({
    data: {
      name: '株式会社わんわん',
    },
  });

  console.log('=========== TeramPrompt ===========');
  await prisma.teamPrompt.create({
    data: {
      team: {
        connect: {
          id: testTeam.id,
        },
      },
      name: 'わんわんについて',
      content: `株式会社わんわんでは、いわゆる犬の芸をすることによって報酬を得ています。
おて、おかわり、おすわり、ふせなどです。
また散歩は朝、夕、毎日2回行っていますが、それも報酬が発生します。`,
    },
  });

  console.log('=========== Creating Users ===========');

  const testUser = await prisma.user.create({
    data: {
      team: {
        connect: {
          id: testTeam.id,
        },
      },
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
        team: {
          connect: {
            id: testTeam.id,
          },
        },
        name: name,
        email: email,
        password: password,
      },
    });
  }

  console.log('=========== UserPrompt ===========');
  await prisma.userPrompt.create({
    data: {
      team: {
        connect: {
          id: testTeam.id,
        },
      },
      user: {
        connect: {
          id: testUser.id
        }
      },
      name: '私が得意なこと',
      content: `私はおてとおかわりが得意です。会社では通常散歩は2回ですが、私は3回行けます。
また、会社の通常の芸の他に、ジャンプ、くるりんができます。`,
    },
  });

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
      team: {
        connect: {
          id: testTeam.id,
        },
      },
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
      team: {
        connect: {
          id: testTeam.id,
        },
      },
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
