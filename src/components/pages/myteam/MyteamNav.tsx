import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageNav from '../../navigation/PageNav';

const MyteamNav = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <PageNav>
      <li>
        <Link
          className={`${router.pathname === '/myteam/users' ? 'current' : ''}`}
          href='/myteam/users'
        >
          {t('models.user')}
        </Link>
        <Link
          className={`${router.pathname === '/myteam/prompts' ? 'current' : ''}`}
          href='/myteam/prompts'
        >
          {t('prompt')}
        </Link>
      </li>
    </PageNav>
  );
};

export default MyteamNav;
