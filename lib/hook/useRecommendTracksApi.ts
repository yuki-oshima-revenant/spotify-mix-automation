import useSWR from 'swr';
import axios from 'axios';
import { SearchTracksResponse, AudioFeature } from '@/lib/type/spotifyapi';
import { useEffect } from 'react';

const fetcher = (url: string, audioFeature: AudioFeature) => axios.post(url, { audioFeature }).then(res => res.data);

const useRecommendTracksApi = (param: { audioFeature?: AudioFeature }) => {
    const { audioFeature } = param;
    const { data, error, isValidating, mutate } = useSWR<SearchTracksResponse>(
        audioFeature ? ['/api/track/recommend', audioFeature] : null,
        fetcher,
        { initialData: [], shouldRetryOnError: false }
    );

    // useEffect(()=>{
    //     mutate();
    // },[param]);

    return { data, isValidating, mutate }
}

export default useRecommendTracksApi;