import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { formatDate } from '../../utils/formatDate';
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import ChatPage from '../chat';
import { PrismaClient, Subject, Chat } from '@prisma/client';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import Modal from '../../components/modal/Modal';
import { BorderdLinkBtn } from '../../components/button/Button';
import { TextField } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import { Header, Breadcrumb } from '../../components/header/Header';
import FloatingActionButton from '../../components/button/FloatingActionButton';

const prisma = new PrismaClient();

const ChatItem = styled.div`
  cursor: pointer;
  margin-bottom: 2px;
`;

type SubjectPageProps = {
  subject: Subject;
  serverSideChats: Chat[];
};

const SubjectPage = ({ subject: subjectProp, serverSideChats }: SubjectPageProps) => {
  type FormInput = {
    name: string;
  };

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>();

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [subject, setSubject] = useState<Subject>(subjectProp);
  const [chats, setChats] = useState(serverSideChats);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const fetchChats = async () => {
    const getChats = await axios.get(`/api/chats?subjectId=${subject.id}`);
    setChats([...getChats.data]);
  };

  const updateSubject = async (data) => {
    try {
      const response = await axios.put(`/api/subjects/${subject.id}`, data, {
        withCredentials: true,
      });
      setIsOpenEditModal(!isOpenEditModal);
      setSubject(response.data);
      toast.success('更新しました');
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error('An error occurred while updating the subject:', error);
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      if (window.confirm('本当に削除してよろしいですか？')) {
        await axios.delete(`/api/subjects/${subjectId}`, { withCredentials: true });
        router.push('/subjects?deleted=true');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error('An error occurred while deleting the subject:', error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      if (window.confirm('本当に削除してよろしいですか？')) {
        await axios.delete(`/api/chats/${chatId}`, { withCredentials: true });
        toast.success('チャットを削除しました');
        fetchChats();
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error('An error occurred while deleting the chat:', error);
    }
  };

  const toggleModal = (e: React.MouseEvent, chatId: number | null = null) => {
    setSelectedChatId(chatId);
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const toggleEditModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenEditModal(!isOpenEditModal);
      setValue('name', subject.name);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser(session);
      setUser(fetchedUser);
    };
    getUser();
    5;

    chats || fetchChats();
  }, [session]);

  return (
    <Layout title={`Subject: ${subject.name}`}>
      <Header>
        <h1>{subject.name}</h1>
        <div className='ml-auto mr-4'>
          {/* <button onClick={() => editPrompt(subjectPrompt)}>編集</button> */}
          <button onClick={(e) => toggleEditModal(e)}>
            <i className='icon-pen events-none text-2xl mr-1' />
          </button>
          <button onClick={() => deleteSubject(subject.id)}>
            <i className='icon-trash text-2xl' />
          </button>
        </div>
        <BorderdLinkBtn href={`/subjects/${subject.id}/subject-prompts`}>プロンプト</BorderdLinkBtn>
      </Header>
      <Breadcrumb>
        <span>
          <Link href='/subjects'>話題</Link>
        </span>
        <i className='icon-right_arrow' />
        <span>{subject.name}</span>
      </Breadcrumb>

      {chats?.map((chat, index) => (
        <ChatItem
          className='bg-slate-200 hover:bg-slate-300 p-8'
          key={index}
          onClick={(e) => toggleModal(e, chat.id)}
        >
          <p className='text-xs text-gray-400 mb-1'>{formatDate(chat.createdAt.toString())}</p>
          {chat.name}
          <button onClick={() => deleteChat(chat.id)}>
            <i className='icon-trash text-2xl absolute right-3' />
          </button>
        </ChatItem>
      ))}

      <FloatingActionButton type='button' onClick={(e) => toggleModal(e, null)}>
        <i className='icon-comment'></i>
      </FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal} title={`${subject.name}に関するチャット`}>
          <div className='pb-4'>
            <ChatPage
              currentUser={user}
              currentSubject={subject}
              chatId={selectedChatId}
              onChatUpdated={fetchChats}
            />
          </div>
        </Modal>
      )}

      {isOpenEditModal && (
        <Modal close={toggleEditModal} title='話題の編集'>
          <div className='px-4'>
            <form onSubmit={handleSubmit(updateSubject)}>
              <TextField
                {...register('name', {
                  required: '必須項目です',
                  validate: (value) => value.trim() !== '' || 'Name cannot be empty',
                })}
              />
              {errors.name && <p>{errors.name.message}</p>}
              <p className='text-center'>
                <AccentBtn type='submit'>更新</AccentBtn>
              </p>
            </form>
          </div>
        </Modal>
      )}
    </Layout>
  );
};
export default SubjectPage;

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

  const fetchChats = await prisma.chat.findMany({
    where: {
      subjectId: subject.id,
    },
  });
  const serverSideChats = fetchChats.map((chat) => ({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return {
    props: {
      subject: serializedSubject,
      serverSideChats,
    },
  };
};
