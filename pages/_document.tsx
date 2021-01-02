import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {

    render() {
        return (
            <Html lang="ja">
                <Head>
                    <meta property="og:url" content="https://automisce.unronritaro.net" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="AUTOMISCE" />
                    <meta property="og:description" content="Automate Your Mix with Spotify API" />
                    <meta property="og:image" content="/top.png" />
                    <meta property="og:site_name" content="AUTOMISCE" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:image" content="/top.png" />
                    <meta name="description" content="Automate Your Mix with Spotify API"></meta>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
};

export default MyDocument;
