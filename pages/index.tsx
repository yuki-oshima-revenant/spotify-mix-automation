import { useCallback, useEffect, useState, useRef } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import useRecommendTracksApi from '@/lib/hook/useRecommendTracksApi';
// import useLoginApi from '@/lib/hook/useLoginApi';
import { AudioFeature } from '@/lib/type/spotifyapi';
import axios from 'axios';

const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const [query, setQuery] = useState<string[]>();
    const [targetTrack, setTargetTrack] = useState<AudioFeature>();
    const { data: searchData, isValidating: searchLoading, mutate: searchMutate } = useSearchTracksApi({ query });
    const { data: recommendData, isValidating: recommendLoading, mutate: recommendMutate } = useRecommendTracksApi({ audioFeature: targetTrack });
    // const { data: loginData } = useLoginApi();
    const playerRef = useRef<Spotify.SpotifyPlayer | null>(null);
    const [deviceId, setDeviceId] = useState<string>();

    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    useEffect(() => {
        recommendMutate();
    }, [targetTrack]);

    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new Spotify.Player({
                name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: async (cb) => {
                    const loginData = await axios.post('/api/auth/checklogin')
                    cb(loginData.data.accessToken);
                },
                volume: 0.5
            });
            player.addListener('ready', ({ device_id }) => {
                setDeviceId(device_id);
            });
            player.connect();
        };
        if (!window.Spotify) {
            const scriptTag = document.createElement('script');
            scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
            document.head!.appendChild(scriptTag);
        }
    }, []);

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
                        <img
                            src={track.album.images[1].url}
                            onClick={() => {
                                setTargetTrack(track.audioFeatures);
                                axios.post('/api/track/play',
                                    {
                                        deviceId,
                                        uris: [track.uri]
                                    })
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public'];
    const params = new URLSearchParams();
    params.append('client_id', process.env.CLIENT_ID || '');
    params.append('response_type', 'code');
    params.append('redirect_uri', process.env.RETURN_TO || '');
    params.append('scope', scopes.join(' '));
    params.append('state', 'state');
    return {
        props: { loginPath: `https://accounts.spotify.com/authorize?${params.toString()}` }
    }
};

export default Index;
