import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import Color from '../../const/Color';

const Nav = styled.nav`
  width: 220px;
  flex: 0 0 auto;
  padding: 32px 16px;
  /* background: white; */
  border-right: 1px solid ${Color.BORDER_COLOR};
  > ul > li {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    a {
      display: block;
      color: ${Color.PRIMARY};
      padding: 8px 16px;
      border-radius: 4px;
      &.current,
      &:hover {
        background: #eceef4;
        color: ${Color.ACCENT};
      }
    }
  }
`;

const SettingNav = () => {
  const router = useRouter();

  return (
    <Nav>
      <ul>
        <li>
          <Link
            className={`${router.pathname === '/setting/global-prompts' ? 'current' : ''}`}
            href='/setting/global-prompts'
          >
            システムプロンプト
          </Link>
        </li>
        <li>
          <Link
            className={`${router.pathname === '/setting/api-urls' ? 'current' : ''}`}
            href='/setting/api-urls'
          >
            API URL
          </Link>
        </li>
      </ul>
    </Nav>
  );
};

export default SettingNav;
