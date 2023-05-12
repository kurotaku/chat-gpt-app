import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import { useForm } from 'react-hook-form';
import axios from 'axios'
import Layout from '../../components/Layout'
import { TextField, TextArea } from '../../components/form/Input';
import { AccentBtn } from '../../components/button/Button';
import SettingNav from '../../components/pages/setting/SettingNav';
import { Header, Breadcrumb } from '../../components/header/Header';
import Modal from '../../components/modal/Modal'
import FloatingActionButton from '../../components/button/FloatingActionButton'

const apiUrls = () => {
  const { data: session } = useSession()
  const [apiUrls, setApiUrls] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchapiUrls = async () => {
    const responce = await axios.get('/api/apiurls');
    setApiUrls([...responce.data]);
  }

  useEffect(() => {
    fetchapiUrls();
  }, [session]);

  const toggleModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenModal(!isOpenModal);
    }
  };

  const onSubmit = async (data) => {
    await axios.post('/api/apiurls',
      data,
      { withCredentials: true }
    );
    fetchapiUrls();
    reset();
    setIsOpenModal(!isOpenModal);
  }

  return (
    <Layout title="Setting">
      <Header><h1>API URL</h1></Header>
      <Breadcrumb>
        <span>設定</span>
        <i className="icon-right_arrow" />
        <span>API URL</span>
      </Breadcrumb>
      <div className="flex">
        <SettingNav />
        <div className="p-8 w-full">
          {apiUrls?.map((apiUrl, index) => (
            <div key={index} className="bg-slate-200 p-8 mb-1">{apiUrl.name}</div>
          ))}

          <FloatingActionButton type="button" onClick={e => toggleModal(e)}><i className="icon-plus"></i></FloatingActionButton>

          {isOpenModal && (
            <Modal close={toggleModal}>
              <div className="px-8">
              <h2 className="font-bold">API URL作成</h2>
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
            </Modal>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default apiUrls

