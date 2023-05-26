import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PrismaClient } from '@prisma/client';
import { SerializableUser, SerializableTeam } from '../../../types/types';
import { getCommonProps } from '../../../utils/getCommonProps';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header';
import ProfileNav from '../../../components/pages/profile/ProfileNav';
import { TextField } from '../../../components/form/Input';
import { AccentBtn } from '../../../components/button/Button';
import Modal from '../../../components/modal/Modal';
import FloatingActionButton from '../../../components/button/FloatingActionButton';

const prisma = new PrismaClient();

type PromptSubset = {
  id: number;
  name: string;
  content: string;
};

type Props = {
  user: SerializableUser & { team: SerializableTeam };
  prompts: PromptSubset[];
};

const userPrompts = (props: Props) => {
  type FormInput = {
    name: string;
    content: string;
  };

  const { t } = useTranslation('common');

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

  const fetchPrompts = async () => {
    const response = await axios.get(`/api/user-prompts?teamId=${props.user.teamId}`);
    setPrompts([...response.data]);
  };

  const newPrompt = () => {
    setValue('name', '');
    setValue('content', '');
    setIsOpenModal(true);
  };

  const createPrompt = async (data) => {
    await axios.post(
      '/api/user-prompts',
      { ...data, teamId: props.user.teamId },
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
      `/api/user-prompts/${currentPrompt.id}`,
      { ...data, teamId: props.user.teamId },
      { withCredentials: true },
    );
    toast.success('プロンプトを更新しました');
    fetchPrompts();
  };

  const deletePrompt = async (subjectPromptId) => {
    if (window.confirm('本当に削除してよろしいですか？')) {
      await axios.delete(`/api/user-prompts/${subjectPromptId}`, { withCredentials: true });
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
    <Layout title={t('profile')}>
      <Header>
        <h1>{t('profile')}</h1>
      </Header>
      <Breadcrumb>
        <span>{t('profile')}</span>
        <i className='icon-right_arrow' />
        <span>{t('prompt')}</span>
      </Breadcrumb>

      <div className='flex'>
        <ProfileNav />
        <div className='w-full p-8'>
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
        </div>
      </div>

      <FloatingActionButton type='button' onClick={() => newPrompt()}>
        <i className='icon-plus'></i>
      </FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className='px-8'>
            <h2 className='font-bold'>
              {t('models.userPrompt')}
              {currentPrompt ? '編集' : '作成'}
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

export default userPrompts;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const prompts: PromptSubset[] = await prisma.userPrompt.findMany({
    where: {
      userId: commonProps.user.id,
    },
    select: {
      id: true,
      name: true,
      content: true,
    },
  });

  const props: Props = {
    ...commonProps,
    prompts,
  };

  return {
    props: props,
  };
};
