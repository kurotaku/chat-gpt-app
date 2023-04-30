import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Layout from '../../components/Layout'
import { TextField } from '../../components/form/Input';
import { Btn } from '../../components/button/Button';
import SettingNav from '../../components/pages/setting/SettingNav';

const setting = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchPrompts = async () => {
    const responce = await axios.get('/api/apiurls');
    setPrompts([...responce.data]);
  }

  useEffect(() => {
    fetchPrompts();
  }, [session]);

  const onSubmit = async (data) => {
    await axios.post('/api/apiurls',
      data,
      { withCredentials: true }
    );
    fetchPrompts();
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

          {prompts?.map((systemPrompt, index) => (
            <div className="bg-gray-100 p-8 mb-1">{systemPrompt.name}</div>
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
                className="border-gray-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="mb-4">
              <TextField
                {...register("url")}
                type="text"
                placeholder="URLを入力してください"
                className="border-gray-200 focus:outline-none focus:border-cyan-600"
              />
            </div>
            
            <div className="mb-4">
              <TextField
                {...register("method")}
                type="text"
                placeholder="メソッドを指定してください"
                className="border-gray-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <textarea
              {...register('header')}
              className="border w-full p-4 mb-4"
              placeholder="header情報を入力してください"
            />

            <textarea
              {...register('body')}
              className="border w-full p-4 mb-4"
              placeholder="body情報を入力してください"
            />
            <p className="text-center">
              <Btn
                type="submit"
                className="bg-cyan-900 text-white disabled:bg-gray-300"
                disabled={false}
              >
                作成
              </Btn>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default setting

