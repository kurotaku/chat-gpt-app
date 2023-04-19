import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from "next-auth/react"
import Layout from '../components/Layout'
import ChatUI from '../components/chat/ChatUI'
import Modal from '../components/modal/Modal'
import fetchCurrentUser from '../utils/fetchCurrentUser';

const IndexPage = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await fetchCurrentUser(session);
      setUser(currentUser);
    };

    getUser();
  }, [session]);

  const toggleModal = e => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const msg: String = session ? 'ログイン済み' : 'ログインしてない'
  
  return(
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello {user?.name} 👋</h1>
      <p>{msg}</p>
      <p>
        <Link href="/about">About</Link>
      </p>

      <button type="button" onClick={toggleModal}>
        Open!
      </button>
      {isOpenModal && (
        <Modal close={toggleModal}>
          <div className="pb-4">
            <ChatUI currentUser={user} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
export default IndexPage
