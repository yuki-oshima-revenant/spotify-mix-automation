import '../styles/globals.css'
import type { AppProps /*, AppContext */ } from 'next/app'

const App = ({ Component, pageProps }: AppProps) => {
    return <Component {...pageProps} />
}

export default App
