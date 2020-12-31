import styles from './index.module.less';
import { SearchTracksRecord } from '@/lib/type/spotifyapi';
import { AiOutlinePlus, AiFillPlayCircle, AiFillPauseCircle, AiOutlineMinus } from 'react-icons/ai';
import axios from 'axios';

const TrackCard: React.FunctionComponent<{
    track: SearchTracksRecord,
    isPlaying: boolean,
    setIsPlaying: (b: boolean) => void,
    playingTrack?: SearchTracksRecord,
    setPlayingTrack: (t: SearchTracksRecord) => void,
    playerRef: React.MutableRefObject<Spotify.SpotifyPlayer | null>,
    deviceId?: string,
    inPlaylist: boolean,
    playlistContent: SearchTracksRecord[],
    setPlaylistContent: (t: SearchTracksRecord[]) => void
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
    setPlaylistContent
}) => {
        return (
            <div className={styles.trackCard} key={track.id}>
                <img
                    className={styles.cover}
                    src={track.album.images.find((image) => (image.height === 300))?.url}
                    width="80px"
                    height="80px"
                    alt={track.name}
                />
                <div className={styles.description}>
                    <div className={styles.name}>{track.name}</div>
                    <div className={styles.artist}>{track.artists.map((artist) => artist.name).join(', ')}</div>
                    <div className={styles.params}>
                        <div>{`BPM: ${Math.round(track.audioFeatures?.tempo || 0)}`}</div>
                        <div>{`Danceability: ${track.audioFeatures?.danceability}`}</div>
                    </div>
                </div>
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
                                    if (playingTrack?.id === track.id) {
                                        playerRef.current?.togglePlay();
                                    } else {
                                        playerRef.current?.pause();
                                        setPlayingTrack(track);
                                        axios.post('/api/track/play',
                                            {
                                                deviceId,
                                                uris: [track.uri]
                                            });
                                    }
                                    setIsPlaying(true);
                                }}
                            />
                        </div>
                    )
                }
                {inPlaylist ? (
                    <div className={styles.buttonWrap}>
                        <AiOutlineMinus className={styles.button}
                            onClick={() => {
                                setPlaylistContent([...playlistContent.filter((playlistTrack) => (playlistTrack.id !== track.id))])
                            }}
                        />
                    </div>

                ) : (
                        <div className={styles.buttonWrap}>
                            <AiOutlinePlus className={styles.button}
                                onClick={() => {
                                    setPlaylistContent([...playlistContent, track]);
                                }}
                            />
                        </div>

                    )}
            </div>
        )
    };

export default TrackCard;
