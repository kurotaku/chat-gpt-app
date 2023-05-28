import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SerializableUser, SerializableUserConfig, SerializableTeam } from '../../../types/types';
import { getCommonProps } from '../../../utils/getCommonProps';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header';
import ProfileNav from '../../../components/pages/profile/ProfileNav';
import { TextField } from '../../../components/form/Input';

type Props = {
  user: SerializableUser & { team: SerializableTeam; userConfig: SerializableUserConfig };
};

const userConfig = (props: Props) => {
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
        <span>{t('profile')}</span>
        <i className='icon-right_arrow' />
        <span>{t('prompt')}</span>
      </Breadcrumb>

      <div className='flex'>
        <ProfileNav />
        <div className='w-full p-8'>
          {props.user.accountType == 'COMPANY' && (
            <div className='mb-4'>
              <p className='mb-2'>「{t('models.team')}」の表記</p>
              <TextField
                onChange={(e) => setTeamLabel(e.target.value)}
                value={teamLabel}
                placeholder={t('models.team')}
              />
            </div>
          )}

          <div className='mb-4'>
            <p className='mb-2'>「{t('models.subject')}」の表記</p>
            <TextField
              onChange={(e) => setSubjectLabel(e.target.value)}
              value={subjectLabel}
              placeholder={t('models.subject')}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default userConfig;

export const getServerSideProps: GetServerSideProps = async (context) => {
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
};
