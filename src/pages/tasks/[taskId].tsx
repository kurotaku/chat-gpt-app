// pages/index.tsx
import { getCommonProps } from '../../utils/getCommonProps';
import { PrismaClient, Task } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { withAuth } from '../../utils/withAuth';
import { useTranslation } from 'next-i18next';
import {
  SerializableUser,
  SerializableUserConfig,
  SerializableTeam,
  SerializableTask,
} from '../../types/types';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import axios from 'axios';
import Layout from '../../components/Layout';
import { TextField, TextArea } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import { Header, Breadcrumb } from '../../components/header/Header';
import { BorderdBtn } from '../../components/button/Button';

const prisma = new PrismaClient();

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
  task: SerializableTask;
};

type TaskLog = {
  number: number;
  content: string;
};

type FormInput = {
  start: number;
  end: number;
  url: string;
  content: string;
};

const delay = 5 * 20 * 1000; // 5 minutes

const TaskPage: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation('common');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormInput>({
    mode: 'onChange',
  });
  const watchFields = watch();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<string>('停止中');
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  let current = null;

  const callApi = async (url: string, content: string, start: number, end: number) => {
    setStatus('実行中');

    if (current === null) {
      current = start;
    }

    console.log('start', start);
    console.log('current', current);

    try {
      const response = await axios.post(url, { content: content, current: current });
      console.log(response.data);
      const currentNumber = current;
      setTaskLogs((prevLogs) => [
        ...prevLogs,
        { number: currentNumber, content: response.data.message },
      ]);

      if (current >= start && current < end) {
        current++;
      } else {
        stopApiCall();
        setError(null);
        return;
      }
    } catch (e) {
      setError(e);
    } finally {
      setStatus('待機中');
    }

    console.log('callAPI End');
  };

  const stopApiCall = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus('停止中');
    }
  };

  useEffect(() => {
    setValue('url', props.task.defaultUrl);
    setValue('content', props.task.defaultContent);
    return () => {
      stopApiCall();
    };
  }, []);

  const onSubmit = (data: FormInput) => {
    console.log(data);
    callApi(data.url, data.content, data.start, data.end); // initial fetch
    intervalRef.current = setInterval(
      () => callApi(data.url, data.content, data.start, data.end),
      delay,
    ); // start regular polling
  };

  return (
    <Layout title={`${t('models.task')}: ${props.task.name}`}>
      <Header>
        <h1>{props.task.name}</h1>
      </Header>

      <Breadcrumb>
        <span>
          <Link href='/tasks'>{t('models.task')}</Link>
        </span>
        <i className='icon-right_arrow' />
        <span>{props.task.name}</span>
      </Breadcrumb>

      <div className='p-8'>
        <form className='mb-2' onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <p className='mb-2'>開始番号</p>
            <TextField {...register('start', { required: true })} placeholder='1' />
          </div>

          <div className='mb-4'>
            <p className='mb-2'>終了番号</p>
            <TextField {...register('end', { required: true })} placeholder='100' />
          </div>

          <div className='mb-4'>
            <p className='mb-2'>APIURL</p>
            <TextField {...register('url', { required: true })} />
          </div>

          <div className='mb-4'>
            <p className='mb-2'>内容</p>
            <TextArea {...register('content', { required: true })} />
          </div>

          <AccentBtn type='submit' className='disabled:bg-gray-300' disabled={!isValid}>
            実行
          </AccentBtn>
        </form>

        <BorderdBtn className='mb-4' onClick={stopApiCall}>
          停止
        </BorderdBtn>
        <p>{status}</p>
      </div>

      <ul>
        {taskLogs.map((taskLog, index) => (
          <li key={index} className='block bg-slate-200 p-8 mb-1'>
            {taskLog.number}
            <p>{taskLog.content}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default TaskPage;

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const { taskId } = context.params;
  const task: Task = await prisma.task.findUnique({
    where: {
      id: Number(taskId),
    },
  });

  if (!task) {
    return {
      notFound: true,
    };
  }

  const props: Props = {
    ...commonProps,
    task: {
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    },
  };

  return {
    props: props,
  };
});
