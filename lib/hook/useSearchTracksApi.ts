import useSWR from 'swr';
import axios from 'axios';
import { SearchTracksResponse } from '@/lib/type/spotifyapi';

const fetcher = (url: string, query: string[]) => axios.post(url, { query }).then(res => res.data);
const useSearchTracksApi = (param: { query?: string[] }) => {
    const { query } = param;
    const { data, error, isValidating, mutate } = useSWR<SearchTracksResponse>(
        query ? ['/api/track/search', query] : null,
        fetcher,
        { initialData: [], shouldRetryOnError: false }
    );
    return { data, isValidating, mutate }
}

export default useSearchTracksApi;