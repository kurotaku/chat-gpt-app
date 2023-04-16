import Link from 'next/link'
import Layout from '../components/Layout'
import { useSession } from "next-auth/react"

const IndexPage = () => {
  const { data: session } = useSession()
  const msg: String = session ? 'ログイン済み' : 'ログインしてない'
  
  return(
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <p>{msg}</p>
      <p>
        <Link href="/about">About</Link>
      </p>
    </Layout>
  )
}
export default IndexPage
