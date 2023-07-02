import { GetServerSideProps } from 'next';
import { withAuth } from '../../../utils/withAuth';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession } from 'next-auth/react';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header';
import MyteamNav from '../../../components/pages/myteam/MyteamNav';
import { PrismaClient, User, Team } from '@prisma/client';

const prisma = new PrismaClient();

type SerializableUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type SerializableTeam = Omit<Team, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type UserSubset = {
  name: string;
  email: string;
};

type Props = {
  user: SerializableUser & { team: SerializableTeam };
  users: UserSubset[];
};

const myteamUsers = (props: Props) => {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('myteam')}>
      <Header>
        <h1>{t('myteam')}</h1>
      </Header>
      <Breadcrumb>
        <span>{t('myteam')}</span>
        <i className='icon-right_arrow' />
        <span>{t('models.user')}</span>
      </Breadcrumb>

      <div className='flex'>
        <MyteamNav />
        <div className='p-8'>
          {props.users.map((user, index) => (
            <div>{user.name}</div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default myteamUsers;

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { props: {} };
  }

  const user: User & { team: Team } = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { team: true },
  });

  const users: UserSubset[] = await prisma.user.findMany({
    where: {
      teamId: user.teamId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  const props: Props = {
    ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      team: {
        ...user.team,
        createdAt: user.team.createdAt.toISOString(),
        updatedAt: user.team.updatedAt.toISOString(),
      },
    },
    users,
  };

  return {
    props: props,
  };
});
