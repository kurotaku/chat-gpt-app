import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageNav from '../../navigation/PageNav';

const ProfileNav = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <PageNav>
      <li>
        <Link className={`${router.pathname === '/profile' ? 'current' : ''}`} href='/profile'>
          {t('profile')}
        </Link>
      </li>
      <li>
        <Link
          className={`${router.pathname === '/profile/prompts' ? 'current' : ''}`}
          href='/profile/prompts'
        >
          {t('prompt')}
        </Link>
      </li>
      <li>
        <Link
          className={`${router.pathname === '/profile/config' ? 'current' : ''}`}
          href='/profile/config'
        >
          {t('config')}
        </Link>
      </li>
    </PageNav>
  );
};

export default ProfileNav;
