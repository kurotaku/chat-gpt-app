import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import axios from 'axios';
import fetchCurrentUser from '../utils/fetchCurrentUser';
import { formatDate } from '../utils/formatDate';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Modal from '../components/modal/Modal';
import { Header } from '../components/header/Header';
import FloatingActionButton from '../components/button/FloatingActionButton';
import ChatPage from './chat';
import { PrismaClient, Chat } from '@prisma/client';
const prisma = new PrismaClient();

const ChatItem = styled.div`
  cursor: pointer;
  margin-bottom: 2px;
`;

type IndexProps = {
  serverSideChats: Chat[];
};

const IndexPage = ({ serverSideChats }: IndexProps) => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState(serverSideChats);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const fetchChats = async () => {
    const responce = await axios.get('/api/private/chats');
    setChats([...responce.data]);
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

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser();
      setUser(fetchedUser);
    };
    getUser();

    chats || fetchChats();
  }, [session]);

  return (
    <Layout title={t('home')}>
      <Header>
        <h1>{t('home')}</h1>
      </Header>
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
        <Modal close={toggleModal}>
          <div className='pb-4'>
            <ChatPage
              currentUser={user}
              currentSubject={null}
              chatId={selectedChatId}
              onChatUpdated={fetchChats}
            />
          </div>
        </Modal>
      )}
    </Layout>
  );
};
export default IndexPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      props: {},
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      }
    };
  }

  const response = await prisma.chat.findMany({
    where: {
      subjectId: null,
    },
  });
  const serverSideChats = response.map((chat) => ({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return {
    props: {
      ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
      serverSideChats,
    },
  };
};
