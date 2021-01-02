import withSession from '@/lib/middleware/session';
import { ApiHandler } from '@/lib/type/handler';
import executeRefreshToken from '@/lib/util/refreshToken';
import moment from 'moment';

export interface ResponseBody {
    accessToken?: string,
    message?: string
}

const checklogin: ApiHandler<{}, ResponseBody> = async (req, res) => {
    try {
        const { accessToken, refreshToken, authedTs, expiresIn, userId } = req.session.get('user');
        const now = moment();
        if (now.diff(moment(authedTs), 'seconds') < (expiresIn - 10 * 60)) {
            if (refreshToken) {
                const response = await executeRefreshToken(refreshToken);
                req.session.set('user', {
                    accessToken: response.access_token,
                    userId,
                    authedTs: now.format('YYYY-MM-DD HH:mm:ss'),
                    expiresIn: response.expires_in
                });
                res.status(200);
                res.json({ accessToken: response.access_token });
            } else {
                res.status(401)
                res.json({ message: 'unauthorized' });
            }
        }
        else {
            res.status(200);
            res.json({ accessToken });
        }
    } catch (e) {
        res.status(500).send(e.message)
    }
}

export default withSession(checklogin);
