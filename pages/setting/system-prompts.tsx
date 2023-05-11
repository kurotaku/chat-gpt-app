import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import Layout from '../../components/Layout'
import Modal from '../../components/modal/Modal'
import { AccentBtn } from '../../components/button/Button';
import SettingNav from '../../components/pages/setting/SettingNav';
import { Header, Breadcrumb } from '../../components/header/Header';
import FloatingActionButton from '../../components/button/FloatingActionButton'

const systemPrompts = () => {
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

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    await axios.post('/api/system-prompts',
      data,
      { withCredentials: true }
    );
    fetchPrompts();
    reset();
    setIsOpenModal(!isOpenModal);
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
          {prompts?.map((systemPrompt, index) => (
            <div key={index} className="bg-slate-200 p-8 mb-1">{systemPrompt.content}</div>
          ))}

          <FloatingActionButton type="button" onClick={e => toggleModal(e)}><i className="icon-plus"></i></FloatingActionButton>

          {isOpenModal && (
            <Modal close={toggleModal}>
              <div className="px-8">
                <h2 className="font-bold">プロンプト作成</h2>
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
              
            </Modal>
          )}
          
        </div>
      </div>
    </Layout>
  )
}

export default systemPrompts
