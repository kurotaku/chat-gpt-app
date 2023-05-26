import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, User, Team, UserConfig } from '@prisma/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SerializableUser, SerializableUserConfig, SerializableTeam } from '../types/types';

const prisma = new PrismaClient();

export async function getCommonProps(context: GetServerSidePropsContext): Promise<{
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
}> {
  const session = await getSession(context);
  if (!session) {
    return null;
  }

  const user: User & { team: Team; userConfig: UserConfig } = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { team: true, userConfig: true },
  });

  return {
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
      userConfig: user.userConfig
        ? {
            ...user.userConfig,
            createdAt: user.userConfig.createdAt.toISOString(),
            updatedAt: user.userConfig.updatedAt.toISOString(),
          }
        : null,
    },
  };
}
