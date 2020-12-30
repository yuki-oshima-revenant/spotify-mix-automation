import { useCallback, useEffect, useState, useRef } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';

import Div100vh from 'react-div-100vh'
import styles from '@/styles/index.module.less';
import useSearchTracksApi from '@/lib/hook/useSearchTracksApi';
import { AiFillGithub } from "react-icons/ai";
import { FaSpotify } from "react-icons/fa";
import useLoginApi from '@/lib/hook/useLoginApi';


const Index = ({ loginPath }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const { data: loginData } = useLoginApi();
    const [query, setQuery] = useState<string[]>([]);
    const { data: searchData, isValidating: searchLoading, mutate: searchMutate } = useSearchTracksApi({ query });
    const login = useCallback(() => {
        window.location.href = loginPath;
    }, [loginPath]);

    useEffect(() => {
        searchMutate();
    }, [query]);

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
                            <div>
                                <input onChange={(e) => { setQuery(e.target.value.replace(/　/g, ' ').split(' ')) }} />
                            </div>
                            <div>
                                {searchData && searchData.tracks.map((track) => {
                                    return (
                                        <div key={track.id}>
                                            <div>{track.artists.map((artist) => artist.name).join(', ')}</div>
                                            <div>{track.name}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className={styles.playlistCard}>

                        </div>
                    </div>
                </div>
                <footer className={styles.footer}>© 2021 Yuki Oshima</footer>
            </Div100vh>
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
