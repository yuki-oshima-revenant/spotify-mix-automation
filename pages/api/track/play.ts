import { ApiHandler } from '@/lib/type/handler';
import axios from 'axios';
import withSession from '@/lib/middleware/session';

export interface RequestBody { deviceId: string, uris: string[] }

const playTrack: ApiHandler<RequestBody, {}> = async (req, res) => {
    try {
        const { deviceId, uris } = req.body;
        const accessToken = req.session.get('user').accessToken;

        const playParams = new URLSearchParams();
        playParams.append('device_id', deviceId);
        await axios.put(
            `https://api.spotify.com/v1/me/player/play?${playParams.toString()}`,
            { uris },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        ).catch(e=>{
            console.log(e);  
        });
        res.status(200).end();
    } catch (e) {
        res.status(500).send(e.message);
    }
};

export default withSession(playTrack);
