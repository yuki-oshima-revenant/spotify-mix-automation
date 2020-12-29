import { useCallback } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next'

const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [process.env]);

    return (
        <button onClick={login}>
            ログイン
        </button>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: { loginPath: `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.RETURN_TO || '')}&scope=playlist-modify-public&state=state` }
    }
};

export default Index;
