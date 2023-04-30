import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Layout from '../../components/Layout'
import { TextField, TextArea } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import SettingNav from '../../components/pages/setting/SettingNav';

const setting = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [apiUrls, setApiUrls] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchapiUrls = async () => {
    const responce = await axios.get('/api/apiurls');
    setApiUrls([...responce.data]);
  }

  useEffect(() => {
    fetchapiUrls();
  }, [session]);

  const onSubmit = async (data) => {
    await axios.post('/api/apiurls',
      data,
      { withCredentials: true }
    );
    fetchapiUrls();
    reset();
  }

  return (
    <Layout title="Setting">
      <div className="flex">
        <SettingNav />
        <div className="p-8 w-full">
          <div className='mb-4'>
            <h1 className="font-bold">API URL</h1>
          </div>

          {apiUrls?.map((apiUrl, index) => (
            <div key={index} className="bg-white p-8 mb-1">{apiUrl.name}</div>
          ))}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mt-8'
          >
            <div className="mb-4">
              <TextField
                {...register("name")}
                type="text"
                placeholder="呼びだすためのテキストを指定してください"
              />
            </div>

            <div className="mb-4">
              <TextField
                {...register("url")}
                type="text"
                placeholder="URLを入力してください"
              />
            </div>
            
            <div className="mb-4">
              <TextField
                {...register("method")}
                type="text"
                placeholder="メソッドを指定してください"
              />
            </div>

            <TextArea
              {...register('header')}
              className="border w-full p-4 mb-4"
              placeholder="header情報を入力してください"
            />

            <TextArea
              {...register('body')}
              className="border w-full p-4 mb-4"
              placeholder="body情報を入力してください"
            />
            <p className="text-center">
              <AccentBtn
                type="submit"
                className="disabled:bg-gray-300"
                disabled={false}
              >
                作成
              </AccentBtn>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default setting

