import { ApiHandler } from '@/lib/type/handler';
import axios from 'axios';
import withSession from '@/lib/middleware/session';

interface SpotifyCreatePlaylistApiResponse {
    id: string
}
export interface RequestBody { name: string, isPublic: boolean, uris: string[], playListId?: string }

export interface ResponseBody { playListId: string }

const playTrack: ApiHandler<RequestBody, ResponseBody> = async (req, res) => {
    try {
        const { name, isPublic, uris, playListId } = req.body;
        const { accessToken, userId } = req.session.get('user');
        let createResponse;
        if (!playListId) {
            createResponse = await axios.post<SpotifyCreatePlaylistApiResponse>(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                { name, public: isPublic },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
        }
        const createdPlayListId = playListId || createResponse?.data.id;
        await axios.put(
            `https://api.spotify.com/v1/playlists/${createdPlayListId}/tracks`,
            { uris },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        res.status(200).json({ playListId: createdPlayListId });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

export default withSession(playTrack);
