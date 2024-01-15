import { useState } from 'react';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CtxOrReq } from 'next-auth/client/_utils';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../components/form/ErrorMessage';
import { AccentBtn } from '../../components/button/Button';
import { TextField } from '../../components/form/Input';

var md5 = require('md5');

interface FormInput {
  email?: string;
  password?: string;
}

const Login = ({ csrfToken }: { csrfToken: string | undefined }) => {
  console.log(csrfToken);
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<FormInput>();

  const signInUser = async (data: FormInput) => {
    await signIn<any>('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: `${window.location.origin}`,
    }).then((res) => {
      if (res?.error) {
        setError('Email,Passwordを正しく入力してください');
      } else {
        router.push('/');
      }
    });
  };

  return (
    <>
      <Head>
        <title>ログイン</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <div style={{ textAlign: 'center' }}>
        <form onSubmit={handleSubmit(signInUser)}>
          <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
          <div style={{ marginTop: '15px' }}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <TextField
              {...register('email')}
              type='text'
              placeholder='Email'
              className='border-gray-200 focus:outline-none focus:border-cyan-600 mb-2'
            />
          </div>
          <div>
            <label htmlFor='password'></label>
            <TextField
              {...register('password')}
              type='password'
              placeholder='Password'
              className='border-gray-200 focus:outline-none focus:border-cyan-600 mb-2'
            />
          </div>
          <div>
            <AccentBtn type='submit'>ログイン</AccentBtn>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;

// POSTリクエスト（サインイン・サインアウトなど）に必要なCSRFトークンを返却する
export const getServerSideProps = async (context: CtxOrReq | undefined) => {

  console.log('==========*************');

  const token = await getCsrfToken(context)

  console.log(`Token: ${token}`)

  return {
    props: {
      title: 'login',
      csrfToken: token,
    },
  };
};
