import { useCallback, useEffect, useState, useRef } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import useRecommendTracksApi from '@/lib/hook/useRecommendTracksApi';
import useLoginApi from '@/lib/hook/useLoginApi';
import { AudioFeature } from '@/lib/type/spotifyapi';
import axios from 'axios';
import { RequestBody, ResponseBody } from '@/pages/api/playlist/save';

const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const [query, setQuery] = useState<string[]>([]);
    const [targetTrack, setTargetTrack] = useState<AudioFeature>();
    const { data: searchData, isValidating: searchLoading, mutate: searchMutate } = useSearchTracksApi({ query });
    // const { data: recommendData, isValidating: recommendLoading, mutate: recommendMutate } = useRecommendTracksApi(targetTrack ? { audioFeature: targetTrack } : undefined);
    const { data: loginData } = useLoginApi();
    const playerRef = useRef<Spotify.SpotifyPlayer | null>(null);
    const [deviceId, setDeviceId] = useState<string>();

    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    // useEffect(() => {
    //     recommendMutate();
    // }, [targetTrack]);

    useEffect(() => {
        if (loginData && loginData.accessToken) {
            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new Spotify.Player({
                    name: 'Web Playback SDK Quick Start Player',
                    getOAuthToken: async (cb) => {
                        cb(loginData.accessToken as string);
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
        }
    }, [loginData]);

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
                {(searchData) && searchData.tracks.map((track) => (
                    <div key={track.id}>
                        <img
                            src={track.album.images[1].url}
                            onClick={() => {
                                setTargetTrack(track.audioFeatures);
                                // アプリで開く際はopen.spotify.com/track/[id]に飛ばす
                                // もしくはデバイス一覧を取得してそれで流す
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
            <div>
                <button onClick={() => {
                    playerRef.current?.pause();
                    const param: RequestBody = {
                        name: 'test_playlist',
                        uris: ['spotify:track:0FdLomnIVFfeF0XUC9WWoC'],
                        isPublic: false
                    }
                    axios.post<RequestBody, ResponseBody>('/api/playlist/save', param);
                }}>
                    new playlist
                </button>
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const scopes = ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private'];
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
