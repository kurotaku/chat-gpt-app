import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { Header } from '../../components/header/Header';
import MyteamNav from '../../components/pages/myteam/MyteamNav';

const Profile = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser();
      setUser(fetchedUser);
    };
    user || getUser();
  }, [session]);

  return (
    <Layout title={t('myteam')}>
      <Header>
        <h1>{t('myteam')}</h1>
      </Header>

      <div className="flex">
        <MyteamNav />
        <div className="p-8">
          {user && (
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <td>{user.name}</td>
                </tr>
                <tr>
                  <th></th>
                  <td>{user.team.name}</td>
                </tr>
                <tr>
                  <th></th>
                  <td>{user.email}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Profile

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    },
  }
};
