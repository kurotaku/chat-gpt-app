import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageNav from '../../navigation/PageNav';

const MyteamNav = () => {
  const router = useRouter();

  return (
    <PageNav>
      <li>
        <Link
          className={`${router.pathname === '/setting/global-prompts' ? 'current' : ''}`}
          href='/setting/global-prompts'
        >
          システムプロンプト
        </Link>
      </li>
    </PageNav>
  );
};

export default MyteamNav;
