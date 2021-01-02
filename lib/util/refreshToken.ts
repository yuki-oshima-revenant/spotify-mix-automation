import { SpotifyAuthApiResponse } from '@/lib/type/spotifyapi';
import axios from 'axios';

const refreshToken = async (refreshToken: string) => {

    const clientBuffer = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    const response = await axios.post<SpotifyAuthApiResponse>(
        'https://accounts.spotify.com/api/token',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${clientBuffer.toString('base64')}`
            }
        }
    );
    return response.data;
};
export default refreshToken;
