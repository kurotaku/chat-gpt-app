import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header';
import MyteamNav from '../../../components/pages/myteam/MyteamNav';
import { PrismaClient, User, Team, TeamPrompt } from '@prisma/client';

const prisma = new PrismaClient();

type SerializableUser = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type SerializableTeam = Omit<Team, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type PromptSubset = {
  name: string;
  content: string;
};

type Props = {
  user: SerializableUser & { team: SerializableTeam };
  prompts: PromptSubset[]
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
        <span>{t('prompt')}</span>
      </Breadcrumb>

      <div className="flex">
        <MyteamNav />
        <div className="p-8">
          {props.prompts.map((prompt, index) => (
            <div id={index.toString()}>
              <p>{prompt.name}</p>
              <p>{prompt.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default myteamUsers

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { props: {} }
  }

  const user: User & {team: Team} = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { team: true }
  });

  const prompts: PromptSubset[] = await prisma.teamPrompt.findMany({
    where: {
      teamId: user.teamId
    },
    select: {
      name: true,
      content: true,
    }
  })

  const props: Props = {
    ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      team: {
        ...user.team,
        createdAt: user.team.createdAt.toISOString(),
        updatedAt: user.team.updatedAt.toISOString()
      }
    },
    prompts
  }
  
  return {
    props: props
  }
};
