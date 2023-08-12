import { GetServerSideProps } from 'next';
import { withAuth } from '../../utils/withAuth';
import { getCommonProps } from '../../utils/getCommonProps';
import { PrismaClient, Task } from '@prisma/client';
import {
  SerializableUser,
  SerializableUserConfig,
  SerializableTeam,
  SerializableTask,
} from '../../types/types';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Header } from '../../components/header/Header';

const prisma = new PrismaClient();

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
  tasks: SerializableTask[];
};

const SubjectsIndex = (props: Props) => {
  const { t } = useTranslation('common');
  return (
    <Layout title={t('models.task')}>
      <Header>
        <h1>{t('models.task')}</h1>
      </Header>
      {props.tasks?.map((task, index) => (
        <Link
          key={index}
          href={`/tasks/${task.id}`}
          className='block bg-slate-200 hover:bg-slate-300 p-8 mb-1'
        >
          {task.name}
        </Link>
      ))}
    </Layout>
  );
};

export default SubjectsIndex;

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const tasks: Task[] = await prisma.task.findMany();

  const props: Props = {
    ...commonProps,
    tasks: tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  };

  return {
    props: props,
  };
});
