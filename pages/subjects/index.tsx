import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import { PrismaClient, Subject } from '@prisma/client';
import { toast } from 'react-toastify';
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Layout from '../../components/Layout';
import { Header } from '../../components/header/Header';
import { TextField } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import FloatingActionButton from '../../components/button/FloatingActionButton';

const prisma = new PrismaClient();

type SubjectsIndexProps = {
  serverSideSubjects: Subject[];
};

const SubjectsIndex = ({ serverSideSubjects }: SubjectsIndexProps) => {
  const { t } = useTranslation('common');

  type FormInput = {
    name: string;
  };

  const router = useRouter();
  const { deleted } = router.query;

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState(serverSideSubjects);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormInput>();

  const name = watch('name', '');

  const fetcSubjects = async () => {
    const response = await axios.get('/api/subjects');
    setSubjects([...response.data]);
  };

  useEffect(() => {
    // URLパラメータ"deleted=true"が存在する場合、メッセージを表示
    if (deleted === 'true') {
      toast.success('話題を削除しました');
    }
  }, [deleted]);

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser(session);
      setUser(fetchedUser);
    };
    getUser();
  }, [session]);

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    await axios.post('/api/subjects', data, { withCredentials: true });
    fetcSubjects();
    reset();
    setIsOpenModal(!isOpenModal);
  };

  return (
    <Layout title={t('subject.modelName')}>
      <Header>
        <h1>{t('subject.modelName')}</h1>
      </Header>
      {subjects?.map((subject, index) => (
        <Link
          key={index}
          href={`/subjects/${subject.id}`}
          className='block bg-slate-200 hover:bg-slate-300 p-8 mb-1'
        >
          {subject.name}
        </Link>
      ))}

      <FloatingActionButton type='button' onClick={(e) => toggleModal(e)}>
        <i className='icon-plus'></i>
      </FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className='px-8'>
            <h2 className='font-bold'>{t('subject.modelName')}作成</h2>
            <form onSubmit={handleSubmit(onSubmit)} className='mt-8'>
              <div className='mb-4'>
                <TextField
                  {...register('name', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Name cannot be empty',
                  })}
                  placeholder={t('subject.name')}
                />
                {errors.name && <p className='text-red-600'>{errors.name.message}</p>}
              </div>

              <p className='text-center'>
                <AccentBtn type='submit' className='disabled:bg-gray-300' disabled={!name.trim()}>
                  作成
                </AccentBtn>
              </p>
            </form>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default SubjectsIndex;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const response = await prisma.subject.findMany();
  const serverSideSubjects = response.map((subject) => ({
    ...subject,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  }));

  return {
    props: {
      serverSideSubjects,
      ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    },
  };
};
