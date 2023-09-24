import { GetServerSideProps } from 'next';
import { withAuth } from '../../../utils/withAuth';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { SerializableUser, SerializableUserConfig, SerializableTeam } from '../../../types/types';
import { getCommonProps } from '../../../utils/getCommonProps';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header';
import ProfileNav from '../../../components/pages/profile/ProfileNav';
import { TextField } from '../../../components/form/Input';
import { AccentBtn } from '../../../components/button/Button';

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
};

const changePassword = (props: Props) => {
  const { t } = useTranslation('common');
  const [teamLabel, setTeamLabel] = useState(props.user.userConfig?.teamLabel || '');
  const [subjectLabel, setSubjectLabel] = useState(props.user.userConfig?.subjectLabel || '');
  const [isFirstRender, setIsFirstRender] = useState(true);

  const debouncedUpdateUserConfig = useCallback(
    debounce(async (teamLabel, subjectLabel) => {
      try {
        await axios.put(
          `/api/private/user-config/${props.user.userConfig?.id}`,
          { teamLabel, subjectLabel },
          { withCredentials: true },
        );
        toast.success('更新しました');
      } catch {
        toast.error('更新できませんでした');
      }
    }, 500),
    [],
  );

  useEffect(() => {
    if (!isFirstRender) {
      debouncedUpdateUserConfig(teamLabel, subjectLabel);
    } else {
      setIsFirstRender(false);
    }
  }, [teamLabel, subjectLabel, debouncedUpdateUserConfig]);

  return (
    <Layout title={t('profile')}>
      <Header>
        <h1>{t('profile')}</h1>
      </Header>
      <Breadcrumb>
        <span>
          <Link href='/profile'>{t('profile')}</Link>
        </span>
        <i className='icon-right_arrow' />
        <span>{t('config')}</span>
      </Breadcrumb>

      <div className='flex'>
        <ProfileNav />
        <div className='w-full p-8'>

          <div className='mb-4'>
            <p className='mb-2'>現在の{t('password')}</p>
            <TextField
              type="password"
              onChange={(e) => setSubjectLabel(e.target.value)}
              value={subjectLabel}
              placeholder={t('models.subject')}
            />
          </div>

          <div className='mb-8'>
            <p className='mb-2'>新しい{t('password')}</p>
            <TextField
              type="password"
              onChange={(e) => setSubjectLabel(e.target.value)}
              value={subjectLabel}
              placeholder={t('models.subject')}
            />
          </div>

          <p className='text-left'>
            <AccentBtn type='submit' className='disabled:bg-gray-300'>
              {t('password')}{t('update')}
            </AccentBtn>
          </p>

        </div>
      </div>
    </Layout>
  );
};

export default changePassword;

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  const commonProps = await getCommonProps(context);
  if (!commonProps) {
    return { props: {} };
  }

  const props: Props = {
    ...commonProps,
  };

  return {
    props: props,
  };
});
