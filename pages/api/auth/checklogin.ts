import withSession from '@/lib/middleware/session';
import { ApiHandler } from '@/lib/type/handler';

export interface ResponseBody {
    accessToken?: string,
    message?:string
}

const checklogin: ApiHandler<{}, ResponseBody> = async (req, res) => {
    try {
        const { accessToken } = req.session.get('user');
        if (accessToken) {
            res.status(200)
            res.json({ accessToken });
        } else {
            res.status(401)
            res.json({ message: 'unauthorized' });
        }
    } catch (e) {
        res.status(500).send(e.message)
    }
}

export default withSession(checklogin);
