import { useState } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { CtxOrReq } from "next-auth/client/_utils";
import { useForm } from "react-hook-form";
import ErrorMessage from "../../components/form/ErrorMessage";
import { Btn } from "../../components/button/Button";
import { TextField } from "../../components/form/Input";

var md5 = require("md5");

// POSTリクエスト（サインイン・サインアウトなど）に必要なCSRFトークンを返却する
export const getServerSideProps = async (context: CtxOrReq | undefined) => {
  return {
    props: {
      title: "login",
      csrfToken: await getCsrfToken(context),
    },
  };
};

interface IFormValues {
  email?: string;
  password?: string;
}

const Login = ({ csrfToken }: { csrfToken: string | undefined }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<IFormValues>();
  const signInUser = async (data: IFormValues) => {
  // ここで<any>を書かないとtypeエラーが消えなかったので書いています
    await signIn<any>("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: `${window.location.origin}`,
    }).then((res) => {
      if (res?.error) {
        setError("Email,Passwordを正しく入力してください");
      } else {
      // ログイン後に飛ぶページ
        router.push("/");
      }
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <form onSubmit={handleSubmit(signInUser)}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <div style={{ marginTop: "15px" }}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <TextField
            {...register("email")}
            type="text"
            placeholder="Email"
            className="border-gray-200 focus:outline-none focus:border-cyan-600 mb-2"
           />
        </div>
        <div>
          <label htmlFor="password"></label>
          <TextField
            {...register("password")}
            type="password"
            placeholder="Password"
            className="border-gray-200 focus:outline-none focus:border-cyan-600 mb-2"
           />
        </div>
        <div>
          <Btn type="submit" className="bg-cyan-900 text-white hover:bg-cyan-950">ログイン</Btn>
        </div>
      </form>
    </div>
  );
};

export default Login;
