import useSWR from 'swr';
import axios from 'axios';
import { AudioFeature } from '@/lib/type/spotifyapi';
import { RequestBody, ResponseBody } from '@/pages/api/track/recommend';

const fetcher = (url: string, audioFeature: AudioFeature) => axios.post(url, { audioFeature }).then(res => res.data);

const useRecommendTracksApi = (param?: RequestBody) => {
    const { data, error, isValidating, mutate } = useSWR<ResponseBody>(
        param ? ['/api/track/recommend', param?.audioFeature] : null,
        fetcher,
        { initialData: { upperTracks: [], downerTracks: [] }, shouldRetryOnError: false }
    );

    return { data, isValidating, mutate }
}

export default useRecommendTracksApi;