import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <Head>
        <title>Convex Backend</title>
        <meta name="description" content="Convex backend API" />
      </Head>
      
      <h1>Convex Backend</h1>
      <p>A smart internal search tool backend</p>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        This is the Convex backend API. The backend functions are deployed on Convex&apos;s platform.
      </p>
    </div>
  );
};

export default Home;

