import type { NextApiRequest, NextApiResponse } from 'next';

interface SessionContent {
    accessToken: string
    refreshToken: string,
}

interface Request extends NextApiRequest {
    session: {
        set: (
            name: string,
            body: SessionContent
        ) => void,
        save: () => Promise<void>,
        get: (name: string) => SessionContent
    }
}

export type ApiHandler = (req: Request, res: NextApiResponse) => Promise<void> | void;
