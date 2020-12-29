import axios from 'axios';
import { SpotifyFeaturesApiResponse } from '@/lib/type/spotifyapi';

const getAudioFeatures = async (ids: string[], accessToken: string) => {
    const featuresParams = new URLSearchParams();
    featuresParams.append('ids', ids.join(','));
    const featuresResponse = await axios.get<SpotifyFeaturesApiResponse>(
        `https://api.spotify.com/v1/audio-features?${featuresParams.toString()}`,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );
    return featuresResponse.data.audio_features;
};
export default getAudioFeatures;
