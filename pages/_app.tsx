import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { ChainProvider } from '@/components/wallet/ChainProvider';

function CreateInterchainApp({ Component, pageProps }: AppProps) {
  return (
    <ChainProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Component {...pageProps} />
      </div>
    </ChainProvider>
  );
}

export default CreateInterchainApp;
