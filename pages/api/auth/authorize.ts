import axios from 'axios';
import withSession from '@/lib/middleware/session';
import { ApiHandler } from '@/lib/type/handler';

interface SpotifyApiResponse {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: number,
    refresh_token: string
}

const authorize: ApiHandler = async (req, res) => {
    try {
        const { code, state } = req.query;

        const clientBuffer = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8');
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code as string);
        params.append('redirect_uri', process.env.RETURN_TO as string);

        const response = await axios.post<SpotifyApiResponse>(
            'https://accounts.spotify.com/api/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${clientBuffer.toString('base64')}`
                }
            }
        );
        req.session.set('token', {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        });
        await req.session.save();
        res.status(200).redirect('/');
    } catch (e) {
        res.status(500).send(e.message)
    }
}

export default withSession(authorize);
