import { useCallback, useEffect, useState, useRef } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Div100vh from 'react-div-100vh'
import styles from '@/styles/index.module.less';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import { AiFillGithub, AiOutlineSave } from "react-icons/ai";
import { IoPlaySharp, IoPauseSharp } from 'react-icons/io5';
import { FaSpotify } from "react-icons/fa";
import useLoginApi from '@/lib/hook/useLoginApi';
import { SearchTracksRecord } from '@/lib/type/spotifyapi';
import TrackCard from '@/lib/component/TrackCard';
import moment from 'moment';
import useRecommendTracksApi from '@/lib/hook/useRecommendTracksApi';
import axios from 'axios';

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
    const [activeTab, setActiveTab] = useState<'search' | 'recommend'>('search');
    const [recommendTargetTrack, setRecommendTargetTrack] = useState<SearchTracksRecord>();
    const { data: recommendData, isValidating: recommendLoading, mutate: recommendMutate } = useRecommendTracksApi(
        recommendTargetTrack ? { track: recommendTargetTrack } : undefined
    );
    const seekbarRef = useRef<HTMLDivElement | null>(null);
    const [playingTrackPosition, setPlayingTrackPosition] = useState<number>(0)


    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    useEffect(() => {
        searchMutate();
    }, [query]);

    useEffect(() => {
        recommendMutate();
        if (recommendTargetTrack) {
            setActiveTab('recommend');
        } else {
            setActiveTab('search');
        }
    }, [recommendTargetTrack]);

    useEffect(() => {
        if (loginData && loginData.accessToken) {
            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new Spotify.Player({
                    name: 'AUTOMISCE Player',
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

    useEffect(() => {
        if (isPlaying) {
            const timeout = setInterval(async () => {
                const palyerState = await playerRef.current?.getCurrentState();
                setPlayingTrackPosition(palyerState?.position || 0);
            }, 100);
            return () => { clearInterval(timeout) };
        }
    }, [isPlaying]);

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
                {playingTrack && (
                    <div className={styles.player}>
                        <img
                            src={playingTrack.album.images.find((image) => (image.height === 300))?.url}
                            width="80px"
                            height="80px"
                            alt={playingTrack.name}
                        />
                        <div className={styles.description}>
                            <div className={styles.name}>{playingTrack.name}</div>
                            <div className={styles.artist}>{playingTrack.artists.map((artist) => (artist.name)).join(', ')}</div>
                            <div className={styles.controller}>
                                {isPlaying ?
                                    <IoPauseSharp onClick={() => {
                                        setIsPlaying(false);
                                        playerRef.current?.pause();
                                    }} />
                                    : <IoPlaySharp onClick={() => {
                                        setIsPlaying(true);
                                        playerRef.current?.togglePlay()
                                    }} />}
                                <div
                                    className={styles.seekbar}
                                    ref={seekbarRef}
                                    style={{ backgroundSize: `${(playingTrackPosition / playingTrack.duration_ms) * 100}%` }}
                                    onClick={(e) => {
                                        const mouse = e.pageX;
                                        const rect = seekbarRef.current?.getBoundingClientRect();
                                        if (rect) {
                                            const position = rect.left + window.pageXOffset;
                                            const offset = mouse - position;
                                            const width = rect?.right - rect?.left;
                                            playerRef.current?.seek(Math.round(playingTrack.duration_ms * (offset / width)))
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            <span className={styles.colorText}>Automate</span> Your Mix<br />
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
                        <div>
                            <div className={styles.titleWrapper}>
                                <div
                                    className={activeTab === 'search' ? styles.title : styles.titleUnselected}
                                    onClick={() => { setActiveTab('search') }}
                                >
                                    Search
                                </div>
                                <div
                                    className={activeTab === 'recommend' ? styles.title : styles.titleUnselected}
                                    onClick={() => { setActiveTab('recommend') }}
                                >
                                    Recommend
                                </div>
                            </div>
                            {activeTab === 'search' ? (
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
                                                    key={track.id}
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
                                                    recommendTargetTrack={recommendTargetTrack}
                                                    setRecommendTargetTrack={setRecommendTargetTrack}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                    <div className={styles.recommendCard}>
                                        <div className={styles.recommendContainer}>
                                            <div className={styles.recommendTypeContainer}>
                                                <div className={styles.recommendTypeUpper}>Get High</div>
                                            </div>
                                            <div className={styles.recommendContent}>
                                                {recommendData && recommendData.upperTracks.map((track) => {
                                                    return (
                                                        <TrackCard
                                                            key={track.id}
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
                                                            recommendTargetTrack={recommendTargetTrack}
                                                            setRecommendTargetTrack={setRecommendTargetTrack}
                                                        />
                                                    )
                                                })}
                                            </div>
                                            <div className={styles.recommendTypeContainer}>
                                                <div className={styles.recommendTypeDowner}>Chill Out</div>
                                            </div>
                                            <div className={styles.recommendContent}>
                                                {recommendData && recommendData.downerTracks.map((track) => {
                                                    return (
                                                        <TrackCard
                                                            key={track.id}
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
                                                            recommendTargetTrack={recommendTargetTrack}
                                                            setRecommendTargetTrack={setRecommendTargetTrack}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div>
                            <div className={styles.titleWrapper}>
                                <div className={styles.title}>Playlist</div>
                            </div>
                            <div className={styles.playlistCard}>
                                <div className={styles.inputContainer}>
                                    <input
                                        className={styles.input}
                                        placeholder="Edit Playlist Name"
                                        onChange={(e) => { setPlaylistName(e.target.value) }}
                                        value={playlistName}
                                    />
                                    <button className={styles.save}
                                        onClick={async () => {
                                            const param = {
                                                name: playlistName,
                                                uris: playlistContent.map((track) => (track.uri)),
                                                isPublic: false
                                            }
                                            try {
                                                axios.post('/api/playlist/save', param);
                                            } catch {

                                            }
                                        }}>
                                        <AiOutlineSave />
                                        Save
                                    </button>
                                </div>
                                <div className={styles.playlistContainer}>
                                    {playlistContent && playlistContent.map((track) => {
                                        return (
                                            <TrackCard
                                                key={track.id}
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
                                                recommendTargetTrack={recommendTargetTrack}
                                                setRecommendTargetTrack={setRecommendTargetTrack}
                                            />
                                        )
                                    })}
                                </div>
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
