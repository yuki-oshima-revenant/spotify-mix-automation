import { withIronSession } from "next-iron-session";
import { ApiHandler } from '@/lib/type/handler';

const withSession = (handler: ApiHandler) => {
    return withIronSession(handler, {
        cookieName: 'app_session',
        password: `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
        cookieOptions: {
            secure: process.env.NODE_ENV === "production",
        },
    });
}

export default withSession;
