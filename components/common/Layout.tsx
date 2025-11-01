import Head from 'next/head';
import { Container } from '@interchain-ui/react';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>FissionPay</title>
        <meta name="description" content="Split bills and receive payments across chains" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Container maxWidth="64rem" attributes={{ py: '$14' }}>
        {children}
      </Container>
    </>
  );
}
