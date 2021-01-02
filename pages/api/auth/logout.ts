import withSession from '@/lib/middleware/session';
import { ApiHandler } from '@/lib/type/handler';

const checklogin: ApiHandler<{}, {}> = async (req, res) => {
    try {
        await req.session.destroy();
        res.status(200);
        res.end();
    } catch (e) {
        res.status(500).send(e.message)
    }
}

export default withSession(checklogin);
