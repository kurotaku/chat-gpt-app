import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useSession } from "next-auth/react"
import ChatUI from './chat'
import Modal from '../components/modal/Modal'

const IndexPage = () => {
  const { data: session } = useSession()
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggleModal = e => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const msg: String = session ? 'ログイン済み' : 'ログインしてない'
  
  return(
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
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
            <ChatUI />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
export default IndexPage
