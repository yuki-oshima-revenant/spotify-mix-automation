import { ApiHandler } from '@/lib/type/handler';
import axios from 'axios';
import withSession from '@/lib/middleware/session';
import { SpotifyRecommendApiResponse, AudioFeature, SearchTracksResponse, SearchTracksRecord } from '@/lib/type/spotifyapi';
import getAudioFeatures from '@/lib/util/getAudioFeatures';

type RecommendType = 'upper' | 'downer';

const getRecommendTracks = async (audioFeature: AudioFeature, accessToken: string, type: RecommendType) => {
    const minDanceability = type === 'upper' ? audioFeature.danceability : audioFeature.danceability * 0.9;
    const maxDanceability = type === 'upper' ? audioFeature.danceability * 1.1 : audioFeature.danceability;

    const recommendationsParams = new URLSearchParams();
    recommendationsParams.set('seed_tracks', audioFeature.id);
    recommendationsParams.set('min_tempo', (audioFeature.tempo * 0.9).toString());
    recommendationsParams.set('max_tempo', (audioFeature.tempo * 1.1).toString());
    recommendationsParams.set('min_danceability', (minDanceability).toString());
    recommendationsParams.set('max_danceability', (maxDanceability).toString());

    const recommendationsResponse = await axios.get<SpotifyRecommendApiResponse>(
        `https://api.spotify.com/v1/recommendations?${recommendationsParams.toString()}`,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    const audioFeatures = await getAudioFeatures(recommendationsResponse.data.tracks.map((item => item.id)), accessToken);
    return recommendationsResponse.data.tracks.map((item) => {
        const targetItemFeature = audioFeatures.find((feature) => (feature.id === item.id));
        return { ...item, audioFeatures: targetItemFeature };
    });
};

export interface RequestBody { track: SearchTracksRecord }

export interface ResponseBody {
    upperTracks: SearchTracksResponse,
    downerTracks: SearchTracksResponse
}

const recommendedTracks: ApiHandler<RequestBody, ResponseBody> = async (req, res) => {
    try {
        const audioFeature = req.body.track.audioFeatures;
        if(!audioFeature){
            res.status(500).send('invalid parameter');
            return;
        }
        const accessToken = req.session.get('user').accessToken;

        const [upperTracks, downerTracks] = await Promise.all(
            [
                getRecommendTracks(audioFeature, accessToken, 'upper'),
                getRecommendTracks(audioFeature, accessToken, 'downer')
            ]
        );

        res.status(200)
        res.json({
            upperTracks,
            downerTracks
        });
    } catch (e) {
        res.status(500).send(e.message);
    }

};
export default withSession(recommendedTracks);
