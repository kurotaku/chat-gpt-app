import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { AccentBtn } from '../../../components/button/Button';
import SettingNav from '../../../components/pages/setting/SettingNav';
import { Header, Breadcrumb } from '../../../components/header/Header';
import Modal from '../../../components/modal/Modal';
import FloatingActionButton from '../../../components/button/FloatingActionButton';

const globalPrompts = () => {
  const { t } = useTranslation('common');

  type FormInput = {
    content: string;
  };

  const { data: session } = useSession();
  const [prompts, setPrompts] = useState(null);
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
    const response = await axios.get('/api/global-prompts');
    setPrompts([...response.data]);
  };

  const newPrompt = () => {
    setValue('content', '');
    setIsOpenModal(true);
  };

  const createPrompt = async (data) => {
    await axios.post('/api/global-prompts', { ...data }, { withCredentials: true });
    toast.success('プロンプトを作成しました');
    fetchPrompts();
    // reset();
  };

  const editPrompt = (prompt) => {
    setCurrentPrompt(prompt);
    setValue('content', prompt.content);
    setIsOpenModal(true);
  };

  const updatePrompt = async (data) => {
    await axios.put(
      `/api/global-prompts/${currentPrompt.id}`,
      { ...data },
      { withCredentials: true },
    );
    toast.success('プロンプトを更新しました');
    fetchPrompts();
  };

  const deletePrompt = async (promptId) => {
    try {
      if (window.confirm('本当に削除してよろしいですか？')) {
        await axios.delete(`/api/global-prompts/${promptId}`, { withCredentials: true });
        toast.success('プロンプトを削除しました');
        fetchPrompts();
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error('An error occurred while deleting the chat:', error);
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

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [session]);

  return (
    <Layout title='Setting'>
      <Header>
        <h1>{t('prompt')}</h1>
      </Header>
      <Breadcrumb>
        <span>設定</span>
        <i className='icon-right_arrow' />
        <span>システムプロンプト</span>
      </Breadcrumb>
      <div className='flex'>
        <SettingNav />
        <div className='p-8 w-full'>
          {prompts?.map((globalPrompt, index) => (
            <div key={index} className='bg-slate-200 p-8 mb-1'>
              {globalPrompt.content}
              <div className='text-right'>
                <button onClick={() => editPrompt(globalPrompt)}>
                  <i className='icon-pen events-none text-2xl' />
                </button>
                <button onClick={() => deletePrompt(globalPrompt.id)}>
                  <i className='icon-trash text-2xl' />
                </button>
              </div>
            </div>
          ))}

          <FloatingActionButton type='button' onClick={(e) => toggleModal(e)}>
            <i className='icon-plus'></i>
          </FloatingActionButton>

          {isOpenModal && (
            <Modal
              close={toggleModal}
              title={`システム全体で使うプロンプトの${currentPrompt ? '編集' : '作成'}`}
            >
              <div className='px-8'>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-8'>
                  <div className='mb-4'>
                    <textarea
                      {...register('content', {
                        required: '必須項目です',
                        validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                      })}
                      className='border w-full p-4'
                      placeholder='GPTへの事前情報となるプロンプトを入力してください'
                    />
                    {errors.content && <p className='text-red-600'>{errors.content.message}</p>}
                  </div>

                  <p className='text-center'>
                    <AccentBtn
                      type='submit'
                      className='disabled:bg-gray-300'
                      disabled={!content.trim()}
                    >
                      {currentPrompt ? '更新' : '作成'}
                    </AccentBtn>
                  </p>
                </form>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default globalPrompts;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    },
  };
};
