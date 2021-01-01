import useSWR from 'swr';
import axios from 'axios';
import { SearchTracksRecord } from '@/lib/type/spotifyapi';
import { RequestBody, ResponseBody } from '@/pages/api/track/recommend';

const fetcher = (url: string, track: SearchTracksRecord) => axios.post(url, { track }).then(res => res.data);

const useRecommendTracksApi = (param?: RequestBody) => {
    const { data, error, isValidating, mutate } = useSWR<ResponseBody>(
        param ? ['/api/track/recommend', param?.track] : null,
        fetcher,
        {
            initialData: { upperTracks: [], downerTracks: [] },
            shouldRetryOnError: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return { data, isValidating, mutate }
}

export default useRecommendTracksApi;