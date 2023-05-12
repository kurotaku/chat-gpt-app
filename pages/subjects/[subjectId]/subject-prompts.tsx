import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { GetServerSideProps } from 'next';
import { useForm } from 'react-hook-form';
import axios from 'axios'
import Link from 'next/link';
import { PrismaClient, Subject, SubjectPrompt } from '@prisma/client';
import Layout from '../../../components/Layout';
import { AccentBtn } from '../../../components/button/Button';
import { Header, Breadcrumb } from '../../../components/header/Header'
import { TextField } from '../../../components/form/Input';
import Modal from '../../../components/modal/Modal'
import FloatingActionButton from '../../../components/button/FloatingActionButton'

const prisma = new PrismaClient();

type SubjectPageProps = {
  subject: Subject;
  serverSideSubjectPrompts: SubjectPrompt[];
};

const SubjectPrompts = ({ subject, serverSideSubjectPrompts }: SubjectPageProps) => {
  type FormInput = {
    name: string;
    content: string;
  };

  const { data: session } = useSession()
  const [subjectPrompts, setSubjectPrompts] = useState(serverSideSubjectPrompts);
  const [isOpenModal, setIsOpenModal] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormInput>();

  const content = watch('content', '');

  const fetchPrompts = async () => {
    const responce = await axios.get(`/api/subject-prompts?subjectId=${subject.id}`);
    setSubjectPrompts([...responce.data]);
  }

  useEffect(() => {
    fetchPrompts();
  }, [session]);

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    await axios.post('/api/subject-prompts',
      {...data, subjectId: subject.id},
      { withCredentials: true }
    );
    fetchPrompts();
    reset();
    setIsOpenModal(!isOpenModal);
  }

  return (
    <Layout title={`Subject: ${subject.name}`}>
      <Header>
        <h1>{subject.name}に関するプロンプト一覧</h1>
      </Header>
      <Breadcrumb>
        <span>話題</span>
        <i className="icon-right_arrow" />
        <span><Link href={`/subjects/${subject.id}`}>{subject.name}</Link></span>
        <i className="icon-right_arrow" />
        <span>プロンプト一覧</span>
      </Breadcrumb>
      {subjectPrompts?.map((subjectPrompt, index) => (
        <div key={index} className="bg-slate-200 p-8 mb-1">
          <h2 className="mb-2 bold">{subjectPrompt.name}</h2>
          <p>{subjectPrompt.content}</p>
        </div>
      ))}

      <FloatingActionButton type="button" onClick={e => toggleModal(e)}><i className="icon-plus"></i></FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className="px-8">
            <h2 className="font-bold">に関するプロンプト作成</h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='mt-8'
            >
              <div className='mb-4'>
                <TextField
                  {...register('name', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                  })}
                  className="mb-4"
                  placeholder='プロンプト名'
                />

                <textarea
                  {...register('content', {
                    required: '必須項目です',
                    validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                  })}
                  className="border w-full p-4"
                  placeholder="プロンプトの内容を入力してください"
                />
                {errors.content && <p className="text-red-600">{errors.content.message}</p>}
              </div>

              <p className="text-center">
                <AccentBtn
                  type="submit"
                  className="disabled:bg-gray-300"
                  disabled={!content.trim()}
                >
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { subjectId } = context.params;
  const subject = await prisma.subject.findUnique({
    where: {
      id: Number(subjectId),
    },
  });

  if (!subject) {
    return {
      notFound: true,
    };
  }

  const serializedSubject = {
    ...subject,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  };

  const subjectPrompts = await prisma.subjectPrompt.findMany({
    where: {
      subjectId: subject.id
    }
  });
  const serverSideSubjectPrompts = subjectPrompts.map((topic) => ({
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  }));

  return {
    props: {
      subject: serializedSubject,
      serverSideSubjectPrompts
    },
  };
};

export default SubjectPrompts;