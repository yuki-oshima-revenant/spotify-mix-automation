import axios from 'axios';
import withSession from '@/lib/middleware/session';
import { ApiHandler } from '@/lib/type/handler';

const checklogin: ApiHandler = async (req, res) => {
    try {
        const { accessToken } = req.session.get('token');
        if (accessToken) {
            res.status(200).json({ accessToken });
        }
    } catch (e) {
        res.status(500).send(e.message)
    }
}

export default withSession(checklogin);
