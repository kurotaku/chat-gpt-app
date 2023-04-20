import { SessionProvider } from 'next-auth/react';
import '../styles/global.scss'
import '../styles/icons.scss';

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;
