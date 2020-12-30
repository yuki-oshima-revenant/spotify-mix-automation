import useSWR from 'swr';
import axios from 'axios';
import { ResponseBody } from '@/pages/api/auth/checklogin'

const fetcher = (url: string) => axios.post(url).then(res => res.data);

const useLoginApi = () => {
    const { data, error, isValidating, mutate } = useSWR<ResponseBody>(
        '/api/auth/checklogin',
        fetcher,
        { shouldRetryOnError: false }
    );

    return { data, isValidating, mutate }
}

export default useLoginApi;