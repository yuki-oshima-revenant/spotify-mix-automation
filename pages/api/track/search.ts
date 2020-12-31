import { ApiHandler } from '@/lib/type/handler';
import axios from 'axios';
import withSession from '@/lib/middleware/session';
import { SpotifySearchApiResponse, SearchTracksResponse } from '@/lib/type/spotifyapi';
import getAudioFeatures from '@/lib/util/getAudioFeatures';

export interface RequestBody { query: string[] }

export interface ResponseBody { tracks: SearchTracksResponse }

const searchTracks: ApiHandler<RequestBody, ResponseBody> = async (req, res) => {
    try {
        const query = req.body.query as string[];
        const accessToken = req.session.get('user').accessToken;

        const searchParams = new URLSearchParams();
        searchParams.append('q', query.join(' '));
        searchParams.append('type', 'track');
        const searchResponse = await axios.get<SpotifySearchApiResponse>(
            `https://api.spotify.com/v1/search?${searchParams.toString()}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );        

        const audioFeatures = await getAudioFeatures(searchResponse.data.tracks.items.map((item => item.id)), accessToken);

        const response: SearchTracksResponse = searchResponse.data.tracks.items.map((item) => {
            const targetItemFeature = audioFeatures.find((feature) => (feature.id === item.id));
            return { ...item, audioFeatures: targetItemFeature };
        });
        res.status(200)
        res.json({ tracks: response });
    } catch (e) {
        res.status(500).send(e.message);
    }

};

export default withSession(searchTracks);
