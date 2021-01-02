import '../styles/globals.less'
import type { AppProps /*, AppContext */ } from 'next/app'
import Head from 'next/head';

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <Head>
                <title>AUTOMISCE</title>
            </Head>
            <Component {...pageProps} />
        </>
    )
}

export default App
