import { GetServerSideProps } from 'next';
import { withAuth } from '../../utils/withAuth';
import { getCommonProps } from '../../utils/getCommonProps';
import { PrismaClient, Subject } from '@prisma/client';
import {
  SerializableUser,
  SerializableUserConfig,
  SerializableTeam,
  SerializableSubject,
} from '../../types/types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { Header } from '../../components/header/Header';
import { TextField } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import FloatingActionButton from '../../components/button/FloatingActionButton';

const prisma = new PrismaClient();

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
  subjects: SerializableSubject[];
};

const SubjectsIndex = (props: Props) => {
  const { t } = useTranslation('common');

  // ユーザーの話題の表記設定があった場合、設定された文字列になる
  const modelName: string = props.user.userConfig.subjectLabel || t('models.subject');

  type FormInput = {
    name: string;
  };

  const router = useRouter();
  const { deleted } = router.query;
  const [subjects, setSubjects] = useState(props.subjects);
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
    const response = await axios.get('/api/private/subjects');
    setSubjects([...response.data]);
  };

  useEffect(() => {
    // URLパラメータ"deleted=true"が存在する場合、メッセージを表示
    if (deleted === 'true') {
      toast.success(`${modelName}を削除しました`);
    }
  }, [deleted]);

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    await axios.post('/api/private/subjects', data, { withCredentials: true });
    fetcSubjects();
    reset();
    setIsOpenModal(!isOpenModal);
    toast.success(`${modelName}を作成しました`);
  };

  return (
    <Layout title={modelName}>
      <Header>
        <h1>{modelName}</h1>
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
            <h2 className='font-bold'>{modelName}作成</h2>
            <form onSubmit={handleSubmit(onSubmit)} className='mt-8'>
              <div className='mb-4'>
                <p className='mb-2'>{modelName}名</p>
                <TextField
                  {...register('name', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Name cannot be empty',
                  })}
                  placeholder={`${modelName}名`}
                />
                {errors.name && <p className='text-red-600'>{errors.name.message}</p>}
              </div>

              <p className='text-center'>
                <AccentBtn type='submit' className='disabled:bg-gray-300' disabled={!name.trim()}>
                  {t('create')}
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

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const subjects: Subject[] = await prisma.subject.findMany();

  const props: Props = {
    ...commonProps,
    subjects: subjects.map((subject) => ({
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    })),
  };

  return {
    props: props,
  };
});
