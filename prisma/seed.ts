import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { createUserWithConfig } from '../src/services/userService';

const prisma = new PrismaClient();

async function main() {
  console.log('=========== Creating GlobalPrompts ===========');
  // await prisma.globalPrompt.create({
  //   data: {
  //     content: `
  //     関西弁で返答してください。
  //     `,
  //   },
  // });

  console.log('=========== Creating Teams ===========');
  const testTeam = await prisma.team.create({
    data: {
      name: 'テストカンパニー',
    },
  });

  console.log('=========== TeramPrompt ===========');
  //   await prisma.teamPrompt.create({
  //     data: {
  //       team: {
  //         connect: {
  //           id: testTeam.id,
  //         },
  //       },
  //       name: 'メルマガの冒頭文',
  //       content: `私が、「日付」、「テーマ」、「星座」を指定して、「メルマガ」と言ったら、
  // 季節を考慮した挨拶と、テーマを絡めたお話と、指定した星座に関する占いとラッキーアイテムを使った300字程度の文章を考えて、
  // 最後は、「今日のダジャレです」と言って、ダジャレを言って終わってください。返答は不要で、考えた文章のみ返してください。`,
  //     },
  //   });

  console.log('=========== Creating Users ===========');

  const testUserData = {
    team: {
      connect: {
        id: testTeam.id,
      },
    },
    name: 'テストユーザー',
    email: 'test@test.com',
    password: bcrypt.hashSync('password', 10),
  };

  const testUserConfigData = {
    teamLabel: '企業',
    subjectLabel: 'テーマ',
  };

  const { user: testUser } = await createUserWithConfig(testUserData, testUserConfigData);

  for (let i = 0; i < 30; i++) {
    faker.locale = 'ja';
    const familyName = faker.name.lastName();
    const firstName = faker.name.firstName();
    const name = familyName + ' ' + firstName;

    faker.locale = 'en';
    const engName = faker.name.fullName().toLowerCase();
    const email = `test${i}@test.com`;
    const password = bcrypt.hashSync('password', 10);

    const userData = {
      team: {
        connect: {
          id: testTeam.id,
        },
      },
      name: name,
      email: email,
      password: password,
    };

    const userConfigData = {
      teamLabel: '企業',
      subjectLabel: 'テーマ',
    };

    await createUserWithConfig(userData, userConfigData);
  }

  console.log('=========== UserPrompt ===========');
  // await prisma.userPrompt.create({
  //   data: {
  //     team: {
  //       connect: {
  //         id: testTeam.id,
  //       },
  //     },
  //     user: {
  //       connect: {
  //         id: testUser.id,
  //       },
  //     },
  //     name: '占い',
  //     content: `私が「ほいさっさ」と言ったら、今日の占いを返答してください。`,
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

  console.log('=========== Task ===========');
  await prisma.task.create({
    data: {
      name: 'Wordpressの投稿内容を変更',
      defaultUrl: '/api/private/tasks/wpPostUpdate',
      defaultContent: `{
  "domain": "${process.env.WP_DOMAIN}",
  "postType": "archived_case",
  "targetDom": "#caseContent",
  "prompt": "想像でいいので内容を膨らませて1000文字程度のhtmlにしてください。<div class="layout-1">の内容はそのまま使用してください。"
}`,
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
