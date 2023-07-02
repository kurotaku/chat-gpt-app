import { GetServerSideProps } from 'next';
import { withAuth } from '../../../utils/withAuth';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { TextField, TextArea } from '../../../components/form/Input';
import { AccentBtn } from '../../../components/button/Button';
import SettingNav from '../../../components/pages/setting/SettingNav';
import { Header, Breadcrumb } from '../../../components/header/Header';
import Modal from '../../../components/modal/Modal';
import FloatingActionButton from '../../../components/button/FloatingActionButton';

const apiUrls = () => {
  const { data: session } = useSession();
  const [apiUrls, setApiUrls] = useState(null);
  const [currentApiUrl, setCurrentApiUrl] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm();

  const fetchapiUrls = async () => {
    const responce = await axios.get('/api/private/apiurls');
    setApiUrls([...responce.data]);
  };

  useEffect(() => {
    fetchapiUrls();
  }, [session]);

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    if (currentApiUrl) {
      await updateApiUrl(data);
    } else {
      await createApiUrl(data);
    }
  };

  const createApiUrl = async (data) => {
    await axios.post('/api/private/apiurls', data, { withCredentials: true });
    toast.success('API URLを作成しました');
    fetchapiUrls();
    reset();
    setIsOpenModal(!isOpenModal);
  };

  const editApiUrl = (apiUrl) => {
    setCurrentApiUrl(apiUrl);
    setValue('name', apiUrl.name);
    setValue('url', apiUrl.url);
    setValue('method', apiUrl.method);
    setValue('header', apiUrl.header);
    setValue('body', apiUrl.body);
    setIsOpenModal(true);
  };

  const updateApiUrl = async (data) => {
    await axios.put(`/api/private/apiurls/${currentApiUrl.id}`, data, { withCredentials: true });
    toast.success('API URLを更新しました');
    fetchapiUrls();
    reset();
    setIsOpenModal(!isOpenModal);
  };

  const deleteApiUrl = async (apiUrlId) => {
    if (window.confirm('本当に削除してよろしいですか？')) {
      await axios.delete(`/api/private/apiurls/${apiUrlId}`, { withCredentials: true });
      toast.success('API URLを削除しました');
      fetchapiUrls();
    }
  };

  return (
    <Layout title='Setting'>
      <Header>
        <h1>API URL</h1>
      </Header>
      <Breadcrumb>
        <span>設定</span>
        <i className='icon-right_arrow' />
        <span>API URL</span>
      </Breadcrumb>
      <div className='flex'>
        <SettingNav />
        <div className='p-8 w-full'>
          {apiUrls?.map((apiUrl, index) => (
            <div key={index} className='bg-slate-200 p-8 mb-1'>
              {apiUrl.name}
              <table>
                <tr>
                  <th className='text-left pr-4'>URL</th>
                  <td>{apiUrl.url}</td>
                </tr>
                <tr>
                  <th className='text-left pr-4'>method</th>
                  <td>{apiUrl.method}</td>
                </tr>
                <tr>
                  <th className='text-left pr-4'>header</th>
                  <td>{apiUrl.header}</td>
                </tr>
                <tr>
                  <th className='text-left pr-4'>body</th>
                  <td>{apiUrl.body}</td>
                </tr>
              </table>
              <div className='text-right'>
                <button onClick={() => editApiUrl(apiUrl)}>
                  <i className='icon-pen events-none text-2xl' />
                </button>
                <button onClick={() => deleteApiUrl(apiUrl.id)}>
                  <i className='icon-trash text-2xl' />
                </button>
              </div>
            </div>
          ))}

          <FloatingActionButton type='button' onClick={(e) => toggleModal(e)}>
            <i className='icon-plus'></i>
          </FloatingActionButton>

          {isOpenModal && (
            <Modal close={toggleModal}>
              <div className='px-8'>
                <h2 className='font-bold'>{currentApiUrl ? 'API URL編集' : 'API URL作成'}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-8'>
                  <div className='mb-4'>
                    <TextField
                      {...register('name')}
                      type='text'
                      placeholder='呼びだすためのテキストを指定してください'
                    />
                  </div>

                  <div className='mb-4'>
                    <TextField
                      {...register('url')}
                      type='text'
                      placeholder='URLを入力してください'
                    />
                  </div>

                  <div className='mb-4'>
                    <TextField
                      {...register('method')}
                      type='text'
                      placeholder='メソッドを指定してください'
                    />
                  </div>

                  <TextArea
                    {...register('header')}
                    className='border w-full p-4 mb-4'
                    placeholder='header情報を入力してください'
                  />

                  <TextArea
                    {...register('body')}
                    className='border w-full p-4 mb-4'
                    placeholder='body情報を入力してください'
                  />
                  <p className='text-center'>
                    <AccentBtn type='submit' className='disabled:bg-gray-300' disabled={false}>
                      {currentApiUrl ? '更新' : '作成'}
                    </AccentBtn>
                  </p>
                </form>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default apiUrls;

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.defaultLocale || 'ja', ['common'])),
    },
  };
});
