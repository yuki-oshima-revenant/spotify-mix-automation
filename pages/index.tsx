import { useCallback, useEffect, useState } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import useRecommendTracksApi from '@/lib/hook/useRecommendTracksApi';
import { AudioFeature } from '@/lib/type/spotifyapi';

const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const [query, setQuery] = useState<string[]>();
    const [targetTrack, setTargetTrack] = useState<AudioFeature>();
    const { data:searchData, isValidating:searchLoading, mutate:searchMutate } = useSearchTracksApi({ query });
    const { data: recommendData, isValidating: recommendLoading, mutate: recommendMutate } = useRecommendTracksApi({ audioFeature: targetTrack });


    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    useEffect(() => {
        recommendMutate();
    }, [targetTrack]);

    return (
        <div>
            <div>
                <button onClick={login}>
                    ログイン
            </button>
            </div>
            <div>
                <input onChange={(e) => { setQuery(e.target.value.replace(/　/g, ' ').split(' ')) }} />
                <button onClick={() => searchMutate()}>検索</button>
            </div>
            <div>
                {(searchData) && searchData.map((track) => (
                    <div key={track.id}>
                        <img src={track.album.images[1].url} onClick={() => { setTargetTrack(track.audioFeatures); }} ></img>
                    </div>
                ))}
            </div>
        </div>

    );
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: { loginPath: `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.RETURN_TO || '')}&scope=playlist-modify-public&state=state` }
    }
};

export default Index;
