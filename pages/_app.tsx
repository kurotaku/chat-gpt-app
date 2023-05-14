import { SessionProvider } from 'next-auth/react';
import { ToastContainer, Slide } from 'react-toastify';
import '../styles/global.scss';
import 'react-toastify/dist/ReactToastify.css';

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ToastContainer position='bottom-right' transition={Slide} />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;
