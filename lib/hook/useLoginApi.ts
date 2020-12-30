import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.post(url).then(res => res.data);

const useLoginApi = () => {
    const { data, error, isValidating, mutate } = useSWR<{
        accessToken: string
    }>(
        '/api/auth/checklogin',
        { shouldRetryOnError: false }
    );

    return { data, isValidating, mutate }
}

export default useLoginApi;