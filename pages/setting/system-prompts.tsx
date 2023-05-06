import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Layout from '../../components/Layout'
import { AccentBtn } from '../../components/button/Button';
import SettingNav from '../../components/pages/setting/SettingNav';
import { Header, Breadcrumb } from '../../components/header/Header';

const setting = () => {
  type FormInput = {
    content: string;
  };

  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormInput>();

  const content = watch('content', '');

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
      <Header><h1>システムプロンプト</h1></Header>
      <Breadcrumb>
        <span>設定</span>
        <i className="icon-right_arrow" />
        <span>システムプロンプト</span>
      </Breadcrumb>
      <div className="flex">
        <SettingNav />
        <div className="p-8 w-full">
          <div className='mb-4'>
            <h1 className="font-bold">システムプロンプト</h1>
          </div>

          {prompts?.map((systemPrompt, index) => (
            <div key={index} className="bg-gray-100 p-8 mb-1">{systemPrompt.content}</div>
          ))}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mt-8'
          >
            <div className='mb-4'>
              <textarea
                {...register('content', {
                  required: '必須項目です',
                  validate: (value) => value.trim() !== '' || 'Content cannot be empty',
                })}
                className="border w-full p-4"
                placeholder="GPTへの事前情報となるプロンプトを入力してください"
              />
              {errors.content && <p className="text-red-600">{errors.content.message}</p>}
            </div>

            <p className="text-center">
              <AccentBtn
                type="submit"
                className="disabled:bg-gray-300"
                disabled={!content.trim()}
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
