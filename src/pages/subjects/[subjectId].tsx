import { GetServerSideProps } from 'next';
import { getCommonProps } from '../../utils/getCommonProps';
import { PrismaClient, Subject, Chat } from '@prisma/client';
import {
  SerializableUser,
  SerializableUserConfig,
  SerializableTeam,
  SerializableSubject,
  SerializableChat,
} from '../../types/types';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { formatDate } from '../../utils/formatDate';
import ChatPage from '../chat';
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

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
  subject: SerializableSubject;
  chats: SerializableChat[];
};

const SubjectPage: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation('common');

  // ユーザーの話題の表記設定があった場合、設定された文字列になる
  const modelName: string = props.user.userConfig.subjectLabel || t('models.subject');

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

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<SerializableSubject>(props.subject);
  const [chats, setChats] = useState(props.chats);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const fetchChats = async () => {
    const getChats = await axios.get(`/api/private/chats?subjectId=${subject.id}`);
    setChats([...getChats.data]);
  };

  const updateSubject = async (data) => {
    try {
      const response = await axios.put(`/api/private/subjects/${subject.id}`, data, {
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
        await axios.delete(`/api/private/subjects/${subjectId}`, { withCredentials: true });
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
        await axios.delete(`/api/private/chats/${chatId}`, { withCredentials: true });
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
    chats || fetchChats();
  }, []);

  return (
    <Layout title={`${modelName}: ${subject.name}`}>
      <Header>
        <h1>{subject.name}</h1>
        <div className='ml-auto mr-4'>
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
          <Link href='/subjects'>{modelName}</Link>
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
              currentUser={props.user}
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

  const chats: Chat[] = await prisma.chat.findMany({
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
    chats: chats.map((chat) => ({
      ...chat,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    })),
  };

  return {
    props: props,
  };
};
