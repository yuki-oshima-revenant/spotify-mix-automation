import useSWR from 'swr';
import axios from 'axios';
import { RequestBody, ResponseBody } from '@/pages/api/track/search';

const fetcher = (url: string, query: string[]) => axios.post(url, { query }).then(res => res.data);
const useSearchTracksApi = (param: RequestBody) => {
    const { query } = param;
    const { data, error, isValidating, mutate } = useSWR<ResponseBody>(
        query.length > 0 ? ['/api/track/search', query] : null,
        fetcher,
        { initialData: { tracks: [] }, shouldRetryOnError: false }
    );
    return { data, isValidating, mutate }
}

export default useSearchTracksApi;