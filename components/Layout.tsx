import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react";

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const { data: session } = useSession();
  
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link> |{' '}
          <Link href="/users">Users List</Link> |{' '}
          {!session && (
            <Link href="/auth/signin">
              ログイン
            </Link>
          )}
          <a href="/api/users">Users API</a>
          <button
            onClick={() => {
              signOut({ callbackUrl: "/auth/signin" }); // 任意のログアウト後に遷移するページへの URL
            }}
          >
            Log out
          </button>
        </nav>
      </header>
      {children}
      <footer>
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
    </div>
  )
}

export default Layout
