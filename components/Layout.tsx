import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react";
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
`

const SiteNav = styled.nav`
  width: 60px;
  height: 100vh;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  position: relative;
  z-index: 10;
`

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const { data: session } = useSession();
  
  return (
    <Wrap>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SiteNav>
        {!session && (
          <Link href="/auth/signin">
            ログイン
          </Link>
        )}

        <ul>
          <li><Link href="/"><i className="icon-home" /></Link></li>
          <li><Link href="/setting"><i className="icon-setting" /></Link></li>
        </ul>
        
        <div className="flex justify-center h-[90%]">
          <button
            className="mt-auto"
            onClick={() => {
              signOut({ callbackUrl: "/auth/signin" }); // 任意のログアウト後に遷移するページへの URL
            }}
          >
            <i className="icon-sign_out" />
          </button>
        </div>
        
      </SiteNav>
      <div className="w-full">{children}</div>
    </Wrap>
  )
}

export default Layout
