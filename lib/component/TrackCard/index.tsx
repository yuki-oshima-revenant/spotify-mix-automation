import styles from './index.module.less';
import { SearchTracksRecord } from '@/lib/type/spotifyapi';
import { AiOutlinePlus, AiFillPlayCircle, AiFillPauseCircle, AiOutlineClose } from 'react-icons/ai';
import axios from 'axios';
import classnames from 'classnames';

const TrackCard: React.FunctionComponent<{
    track: SearchTracksRecord,
    isPlaying: boolean,
    setIsPlaying: (b: boolean) => void,
    playingTrack?: SearchTracksRecord,
    setPlayingTrack: (t?: SearchTracksRecord) => void,
    playerRef: React.MutableRefObject<Spotify.SpotifyPlayer | null>,
    deviceId?: string,
    inPlaylist: boolean,
    playlistContent: SearchTracksRecord[],
    setPlaylistContent: (t: SearchTracksRecord[]) => void,
    recommendTargetTrack?: SearchTracksRecord,
    setRecommendTargetTrack: (t?: SearchTracksRecord) => void;
}> = ({
    track,
    isPlaying,
    setIsPlaying,
    playingTrack,
    setPlayingTrack,
    playerRef,
    deviceId,
    inPlaylist,
    playlistContent,
    setPlaylistContent,
    recommendTargetTrack,
    setRecommendTargetTrack
}) => {
        return (
            <div className={classnames(styles.trackCard, (track.id === recommendTargetTrack?.id && inPlaylist) && styles.recommendedTrack)} key={track.id}>
                <img
                    className={styles.cover}
                    src={track.album.images.find((image) => (image.height === 300))?.url}
                    width="80px"
                    height="80px"
                    alt={track.name}
                    style={inPlaylist ? { cursor: 'pointer' } : {}}
                    onClick={() => {
                        if (inPlaylist) {
                            setRecommendTargetTrack(track);
                        }
                    }}
                />
                <div className={styles.description}>
                    <div className={styles.name}>{track.name}</div>
                    <div className={styles.artist}>{track.artists.map((artist) => artist.name).join(', ')}</div>
                    <div className={styles.params}>
                        <div>{`BPM: ${Math.round(track.audioFeatures?.tempo || 0)}`}</div>
                        <div>{`Danceability: ${track.audioFeatures?.danceability}`}</div>
                        <div>{`Energy: ${track.audioFeatures?.energy}`}</div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    {(isPlaying && playingTrack && track.id === playingTrack.id) ? (
                        <div className={styles.buttonWrap}>
                            <AiFillPauseCircle
                                className={styles.button}
                                onClick={() => {
                                    playerRef.current?.pause();
                                    setIsPlaying(false);
                                }}
                            />
                        </div>
                    )
                        : (
                            <div className={styles.buttonWrap}>
                                <AiFillPlayCircle
                                    className={styles.button}
                                    onClick={() => {
                                        const userAgent = window.navigator.userAgent.toLowerCase();
                                        if (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipad') != -1 || userAgent.indexOf('android') != -1) {
                                            window.open(`https://open.spotify.com/track/${track.id}`)
                                            return;
                                        }
                                        if (playingTrack?.id === track.id) {
                                            playerRef.current?.togglePlay();
                                        } else {
                                            playerRef.current?.pause();
                                            setPlayingTrack(track);
                                            try {
                                                axios.post('/api/track/play',
                                                    {
                                                        deviceId,
                                                        uris: [track.uri]
                                                    });
                                                setIsPlaying(true);
                                            } catch (e) {
                                                // console.log(e.message);
                                                setPlayingTrack();
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )
                    }
                    {inPlaylist ? (
                        <div className={styles.buttonWrap}>
                            <AiOutlineClose className={styles.button}
                                onClick={() => {
                                    if (track.id === recommendTargetTrack?.id) {
                                        if (track.id === playlistContent[playlistContent.length - 1].id) {
                                            if (playlistContent.length >= 2) {
                                                setRecommendTargetTrack(playlistContent[playlistContent.length - 2]);
                                            } else {
                                                setRecommendTargetTrack();
                                            }
                                        } else {
                                            if (playlistContent.length >= 2) {
                                                setRecommendTargetTrack(playlistContent[playlistContent.length - 1]);
                                            } else {
                                                setRecommendTargetTrack();
                                            }
                                        }
                                    }
                                    setPlaylistContent([...playlistContent.filter((playlistTrack) => (playlistTrack.id !== track.id))]);
                                }}
                            />
                        </div>
                    ) : (
                            <div className={styles.buttonWrap}>
                                <AiOutlinePlus className={styles.button}
                                    onClick={() => {
                                        if (!playlistContent.find((playlistTrack) => (playlistTrack.id === track.id))) {
                                            setPlaylistContent([...playlistContent, track]);
                                        }
                                        setRecommendTargetTrack(track);
                                    }}
                                />
                            </div>

                        )}
                </div>

            </div>
        )
    };

export default TrackCard;
