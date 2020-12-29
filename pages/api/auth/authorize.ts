import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { withIronSession } from "next-iron-session";

interface Response {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: number,
    refresh_token: string
}

interface Request extends NextApiRequest {
    session:any
}

const authorize = async (req: Request, res: NextApiResponse) => {
    const { code, state } = req.query;    

    const clientBuffer = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8');
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code as string);
    params.append('redirect_uri', process.env.RETURN_TO as string);

    const response = await axios.post<Response>(
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
}

export default withIronSession(authorize, {
    cookieName: 'app_session',
    password: `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
});
