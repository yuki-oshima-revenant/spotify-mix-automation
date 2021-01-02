import { ApiHandler } from '@/lib/type/handler';
import axios from 'axios';
import withSession from '@/lib/middleware/session';

interface SpotifyCreatePlaylistApiResponse {
    id: string
}
export interface RequestBody { name: string, isPublic: boolean, uris: string[], playlistId?: string }

export interface ResponseBody { playlistId: string }

const playTrack: ApiHandler<RequestBody, ResponseBody> = async (req, res) => {
    try {
        const { name, isPublic, uris, playlistId } = req.body;
        const { accessToken, userId } = req.session.get('user');
        let createResponse;
        if (!playlistId) {
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
        const createdPlaylistId = playlistId || createResponse?.data.id;
        await axios.put(
            `https://api.spotify.com/v1/playlists/${createdPlaylistId}/tracks`,
            { uris },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        res.status(200).json({ playlistId: createdPlaylistId });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

export default withSession(playTrack);
