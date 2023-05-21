import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageNav from '../../navigation/PageNav';

const SettingNav = () => {
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
      <li>
        <Link
          className={`${router.pathname === '/setting/api-urls' ? 'current' : ''}`}
          href='/setting/api-urls'
        >
          API URL
        </Link>
      </li>
    </PageNav>
  );
};

export default SettingNav;
