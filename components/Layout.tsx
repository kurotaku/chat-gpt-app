import React, { ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { signOut } from "next-auth/react"
import styled from 'styled-components';
import Color from './const/Color';

const Wrap = styled.div`
  display: flex;
`

const MainContent = styled.div`
  background-color: ${Color.BG_COLOR};
`

const SiteNav = styled.nav`
  width: 64px;
  height: 100vh;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  position: relative;
  z-index: 10;
`
const Icon = styled.i`
  font-size: 32px;
  &::before{
    color: ${Color.SECONDARY}
  }
  &:hover::before, &.current:before{
    color: ${Color.ACCENT}
  }
`

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const router = useRouter()
  
  return (
    <Wrap>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SiteNav className="pt-8">
        <ul>
          <li className="mb-4"><Link href="/"><Icon className={`icon-home ${router.pathname === '/' ? 'current' : ''}`} /></Link></li>
          <li className="mb-4"><Link href="/setting"><Icon className={`icon-setting ${router.pathname.startsWith('/setting') ? 'current' : ''}`} /></Link></li>
        </ul>
        
        <button
          className="mt-auto"
          onClick={() => {
            signOut({ callbackUrl: "/auth/signin" }); // 任意のログアウト後に遷移するページへの URL
          }}
        >
          <Icon className="icon-sign_out" />
        </button>
      
      </SiteNav>
      <MainContent className="w-full">{children}</MainContent>
    </Wrap>
  )
}

export default Layout
