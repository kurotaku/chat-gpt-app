import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import axios from 'axios'
import Layout from '../components/Layout'
import Modal from '../components/modal/Modal'
import fetchCurrentUser from '../utils/fetchCurrentUser';
import ChatUI from './chat'
import { formatDate } from '../utils/formatDate';
import styled from 'styled-components'
import Color from '../components/const/Color'
import { Header } from '../components/header/Header'

const ChatItem = styled.div`
  cursor: pointer;
  margin-bottom: 2px;
`

const NewBtnWrap = styled.div`
  position: fixed;
  right: 16px;
  bottom: 16px;
`

const NewBtn = styled.button`
  border-radius: 100%;
  display: block;
  position: relative;
  width: 56px;
  height: 56px;
  box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  background-color: ${Color.ACCENT};
  &:hover{
    background-color: ${Color.ACCENT_HOVER}
  }
  &::before, &::after{
    content: "";
    position: absolute;
    top: calc(50% - 12px);
    left: calc(50% - 1px);
    width: 2px;
    height: 24px;
    border-radius: 100px;;
    background: white;
  }
  &::after {
    transform: rotate(90deg);
  }
`

const IndexPage = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState(null);
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

    fetchChats();
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
        <ChatItem className="bg-slate-100 hover:bg-slate-200 p-8" key={index} onClick={e => toggleModal(e, chat.id)}>
          <p className="text-xs text-gray-400 mb-1">{formatDate(chat.createdAt)}</p>
          {chat.name}
        </ChatItem>
      ))}

      <NewBtnWrap><NewBtn type="button" onClick={e => toggleModal(e, null)} /></NewBtnWrap>

      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className="pb-4">
            <ChatUI currentUser={user} chatId={selectedChatId} onChatUpdated={fetchChats} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
export default IndexPage
