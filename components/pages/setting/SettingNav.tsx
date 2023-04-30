import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const Nav = styled.nav`
  flex: 0 0 auto;
  padding: 24px;
  >ul>li{
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
  }
`

const SettingNav = () => {
  return (
    <Nav>
      <ul>
        <li><Link href="/setting">システムプロンプト</Link></li>
        <li><Link href="/setting/api-urls">API URL</Link></li>
      </ul>
    </Nav>
  )
}

export default SettingNav