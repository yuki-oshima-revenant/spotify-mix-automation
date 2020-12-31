import { useCallback, useEffect, useState, useRef } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Div100vh from 'react-div-100vh'
import styles from '@/styles/index.module.less';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import { AiFillGithub } from "react-icons/ai";
import { FaSpotify } from "react-icons/fa";
import useLoginApi from '@/lib/hook/useLoginApi';
import { SearchTracksRecord } from '@/lib/type/spotifyapi';
import TrackCard from '@/lib/component/TrackCard';
import moment from 'moment';

const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const { data: loginData } = useLoginApi();
    const [query, setQuery] = useState<string[]>([]);
    const { data: searchData, isValidating: searchLoading, mutate: searchMutate } = useSearchTracksApi({ query });
    const playerRef = useRef<Spotify.SpotifyPlayer | null>(null);
    const [playingTrack, setPlayingTrack] = useState<SearchTracksRecord>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [deviceId, setDeviceId] = useState<string>();
    const [playlistName, setPlaylistName] = useState<string>(`NewPlaylist_${moment().format('YYYYMMDD')}`);
    const [playlistContent, setPlaylistContent] = useState<SearchTracksRecord[]>([]);

    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    useEffect(() => {
        searchMutate();
    }, [query]);

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
                playerRef.current = player;
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
            <header className={styles.headerTop}>
                <div className={styles.content}>
                    <div className={styles.logo}>AUTOMISCE</div>
                    <div className={styles.spacer} />
                    <a
                        className={styles.iconWrapper}
                        href="https://github.com/yuki-oshima-revenant/spotify-mix-automation"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <AiFillGithub className={styles.icon} />
                    </a>
                </div>
            </header>
            <Div100vh className={styles.contentWrapper}>
                <div className={styles.content}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            Automate Your Mix<br />
                        </h1>
                        <h2 className={styles.lowerTitle}>
                            with <span className={styles.spotify}>Spotify</span> API.
                    </h2>
                    </div>
                    <div className={styles.signin}>
                        <button className={styles.button} onClick={login}>
                            <FaSpotify className={styles.icon} />
                            Sign in with Spotify
                    </button>
                    </div>
                    <div className={styles.mainContainer}>
                        <div className={styles.searchCard}>
                            <div className={styles.inputContainer}>
                                <input
                                    className={styles.input}
                                    placeholder="Search Tracks"
                                    onChange={(e) => { setQuery(e.target.value.replace(/　/g, ' ').split(' ')) }}
                                />
                            </div>
                            <div className={styles.searchResultContainer}>
                                {searchData && searchData.tracks.map((track) => {
                                    return (
                                        <TrackCard
                                            track={track}
                                            isPlaying={isPlaying}
                                            setIsPlaying={setIsPlaying}
                                            playingTrack={playingTrack}
                                            setPlayingTrack={setPlayingTrack}
                                            playerRef={playerRef}
                                            deviceId={deviceId}
                                            inPlaylist={false}
                                            playlistContent={playlistContent}
                                            setPlaylistContent={setPlaylistContent}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        <div className={styles.playlistCard}>
                            <div className={styles.inputContainer}>
                                <input
                                    className={styles.input}
                                    placeholder="Edit Playlist Name"
                                    onChange={(e) => { setPlaylistName(e.target.value) }}
                                    value={playlistName}
                                />
                            </div>
                            <div className={styles.searchResultContainer}>
                                {playlistContent && playlistContent.map((track) => {
                                    return (
                                        <TrackCard
                                            track={track}
                                            isPlaying={isPlaying}
                                            setIsPlaying={setIsPlaying}
                                            playingTrack={playingTrack}
                                            setPlayingTrack={setPlayingTrack}
                                            playerRef={playerRef}
                                            deviceId={deviceId}
                                            inPlaylist
                                            playlistContent={playlistContent}
                                            setPlaylistContent={setPlaylistContent}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <footer className={styles.footer}>© 2021 Yuki Oshima</footer>
            </Div100vh>
        </div >
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
