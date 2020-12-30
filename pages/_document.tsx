import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {

    render() {
        return (
            <Html>
                <Head />
                {/* <script src="https://sdk.scdn.co/spotify-player.js"></script> */}
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
};

export default MyDocument;
