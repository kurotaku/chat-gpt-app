import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import axios from 'axios'
import fetchCurrentUser from '../utils/fetchCurrentUser';
import { formatDate } from '../utils/formatDate';
import styled from 'styled-components'
import Layout from '../components/Layout'
import Modal from '../components/modal/Modal'
import { Header } from '../components/header/Header'
import FloatingActionButton from '../components/button/FloatingActionButton'
import ChatPage from './chat'
import { PrismaClient, Chat } from '@prisma/client';
const prisma = new PrismaClient();

const ChatItem = styled.div`
  cursor: pointer;
  margin-bottom: 2px;
`

type IndexProps = {
  serverSideChats: Chat[];
};

const IndexPage = ({ serverSideChats }: IndexProps) => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState(serverSideChats);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const fetchChats = async () => {
    const responce = await axios.get('/api/chats');
    setChats([...responce.data]);
  }

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser(session);
      setUser(fetchedUser);
    };
    getUser();

    chats || fetchChats();
  }, [session]);

  const toggleModal = (e: React.MouseEvent, chatId: number | null = null) => {
    setSelectedChatId(chatId);
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };
  
  return(
    <Layout title="Home">
      <Header>
        <h1>ホーム</h1>
      </Header>
      {chats?.map((chat, index) => (
        <ChatItem className="bg-slate-200 hover:bg-slate-300 p-8" key={index} onClick={e => toggleModal(e, chat.id)}>
          <p className="text-xs text-gray-400 mb-1">{formatDate(chat.createdAt.toString())}</p>
          {chat.name}
        </ChatItem>
      ))}

      <FloatingActionButton type="button" onClick={e => toggleModal(e, null)}><i className="icon-comment"></i></FloatingActionButton>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className="pb-4">
            <ChatPage currentUser={user} currentSubject={null} chatId={selectedChatId} onChatUpdated={fetchChats} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
export default IndexPage;

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await prisma.chat.findMany({
    where: {
      subjectId: null
    }
  });
  const serverSideChats = response.map((chat) => ({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return {
    props: {
      serverSideChats,
    },
  };
};