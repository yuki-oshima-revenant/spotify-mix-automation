import type { NextApiRequest, NextApiResponse } from 'next';

interface SessionContent {
    userId: string,
    accessToken: string
    refreshToken?: string,
    authedTs: string,
    expiresIn: number,
}

interface Request<T> extends NextApiRequest {
    body: T,
    session: {
        set: (
            name: string,
            body: SessionContent
        ) => void,
        save: () => Promise<void>,
        get: (name: string) => SessionContent,
        destroy: () => Promise<void>
    }
}

interface Response<U> extends NextApiResponse {
    json: (param: U) => void
}

export type ApiHandler<T, U> = (req: Request<T>, res: Response<U>) => Promise<void> | void;
