import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import '../styles/global.scss'

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;
