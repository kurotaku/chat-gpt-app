import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import { PrismaClient, Subject, SubjectPrompt } from '@prisma/client';
import {
  SerializableUser,
  SerializableUserConfig,
  SerializableTeam,
  SerializableSubject,
  SerializableSubjectPrompts,
} from '../../../../types/types';
import { getCommonProps } from '../../../../utils/getCommonProps';
import { toast } from 'react-toastify';
import Layout from '../../../../components/Layout';
import { AccentBtn } from '../../../../components/button/Button';
import { Header, Breadcrumb } from '../../../../components/header/Header';
import { TextField } from '../../../../components/form/Input';
import Modal from '../../../../components/modal/Modal';
import FloatingActionButton from '../../../../components/button/FloatingActionButton';

const prisma = new PrismaClient();

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
  subject: SerializableSubject;
  prompts: SerializableSubjectPrompts[];
};

const SubjectPrompts: React.FC<Props> = (props: Props) => {
  type FormInput = {
    name: string;
    content: string;
  };

  const { t } = useTranslation('common');
  // ユーザーの話題の表記設定があった場合、設定された文字列になる
  const modelName: string = props.user.userConfig.subjectLabel || t('models.subject');

  const [prompts, setPrompts] = useState(props.prompts);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>();

  const content = watch('content', '');

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`/api/subject-prompts?subjectId=${props.subject.id}`);
      setPrompts([...response.data]);
    } catch (e) {
      toast.error('エラーが発生しました');
      console.log('ERROR', e);
    }
  };

  const newPrompt = () => {
    setValue('name', '');
    setValue('content', '');
    setIsOpenModal(true);
  };

  const createPrompt = async (data) => {
    await axios.post(
      '/api/subject-prompts',
      { ...data, subjectId: props.subject.id, teamId: props.user.teamId },
      { withCredentials: true },
    );
    toast.success('プロンプトを作成しました');
    fetchPrompts();
  };

  const editPrompt = (prompt) => {
    setCurrentPrompt(prompt);
    setValue('name', prompt.name);
    setValue('content', prompt.content);
    setIsOpenModal(true);
  };

  const updatePrompt = async (data) => {
    await axios.put(
      `/api/subject-prompts/${currentPrompt.id}`,
      { ...data, subjectId: props.subject.id },
      { withCredentials: true },
    );
    toast.success('プロンプトを更新しました');
    fetchPrompts();
  };

  const deletePrompt = async (subjectPromptId) => {
    if (window.confirm('本当に削除してよろしいですか？')) {
      await axios.delete(`/api/subject-prompts/${subjectPromptId}`, { withCredentials: true });
      toast.success('プロンプトを削除しました');
      fetchPrompts();
    }
  };

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
      setCurrentPrompt(null);
    }
  };

  const onSubmit = async (data) => {
    if (currentPrompt) {
      await updatePrompt(data);
    } else {
      await createPrompt(data);
    }
    setIsOpenModal(!isOpenModal);
  };

  return (
    <Layout title={`${modelName}: ${props.subject.name}`}>
      <Header>
        <h1>{props.subject.name}に関するプロンプト一覧</h1>
      </Header>
      <Breadcrumb>
        <span>
          <Link href='/subjects'>{modelName}</Link>
        </span>
        <i className='icon-right_arrow' />
        <span>
          <Link href={`/subjects/${props.subject.id}`}>{props.subject.name}</Link>
        </span>
        <i className='icon-right_arrow' />
        <span>プロンプト一覧</span>
      </Breadcrumb>
      {prompts?.map((prompt, index) => (
        <div key={index} className='bg-slate-200 p-8 mb-1'>
          <h2 className='mb-2 bold'>{prompt.name}</h2>
          <p>{prompt.content}</p>
          <div className='text-right'>
            <button onClick={() => editPrompt(prompt)}>
              <i className='icon-pen events-none text-2xl' />
            </button>
            <button onClick={() => deletePrompt(prompt.id)}>
              <i className='icon-trash text-2xl' />
            </button>
          </div>
        </div>
      ))}

      <FloatingActionButton type='button' onClick={() => newPrompt()}>
        <i className='icon-plus'></i>
      </FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className='px-8'>
            <h2 className='font-bold'>
              {props.subject.name}に関するプロンプト{currentPrompt ? '編集' : '作成'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='mt-8'>
              <div className='mb-4'>
                <TextField
                  {...register('name', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                  })}
                  className='mb-4'
                  placeholder='プロンプト名'
                />

                <textarea
                  {...register('content', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                  })}
                  className='border w-full p-4'
                  placeholder='プロンプトの内容を入力してください'
                />
                {errors.content && <p className='text-red-600'>{errors.content.message}</p>}
              </div>

              <p className='text-center'>
                <AccentBtn type='submit' className='disabled:bg-gray-300'>
                  {currentPrompt ? '更新' : '作成'}
                </AccentBtn>
              </p>
            </form>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const { subjectId } = context.params;
  const subject: Subject = await prisma.subject.findUnique({
    where: {
      id: Number(subjectId),
    },
  });

  if (!subject) {
    return {
      notFound: true,
    };
  }

  const prompts: SubjectPrompt[] = await prisma.subjectPrompt.findMany({
    where: {
      subjectId: subject.id,
    },
  });

  const props: Props = {
    ...commonProps,
    subject: {
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    },
    prompts: prompts.map((prompt) => ({
      ...prompt,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
    })),
  };

  return {
    props,
  };
};

export default SubjectPrompts;
