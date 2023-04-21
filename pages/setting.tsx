import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import fetchCurrentUser from '../utils/fetchCurrentUser';
import Layout from '../components/Layout'
import { Btn } from '../components/button/Button';

const setting = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchPrompts = async () => {
    const responce = await axios.get('/api/system-prompts');
    setPrompts([...responce.data]);
  }

  useEffect(() => {
    fetchPrompts();
  }, [session]);

  const onSubmit = async (data) => {
    await axios.post('/api/system-prompts',
      data,
      { withCredentials: true }
    );
    fetchPrompts();
    reset();
  }

  return (
    <Layout title="Setting">
      <div className="p-8">
        <div className='mb-4'>
          <h1 className="font-bold">システムプロンプト</h1>
        </div>

        {prompts?.map((systemPrompt, index) => (
          <div className="bg-gray-100 p-8 mb-1">{systemPrompt.content}</div>
        ))}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='mt-8'
        >
          <textarea
            {...register('content')}
            className="border w-full p-4 mb-4"
            placeholder="GPTへの事前情報となるプロンプトを入力してください"
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
    </Layout>
  )
}

export default setting
