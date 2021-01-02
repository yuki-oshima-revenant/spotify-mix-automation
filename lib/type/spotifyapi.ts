export interface SpotifyAuthApiResponse {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: number,
    refresh_token: string
}

type TrackItem = {
    album: { href: string, name: string, images: { url: string, height: number }[] },
    artists: { href: string, name: string }[],
    href: string,
    id: string,
    name: string,
    uri: string,
    duration_ms:number,
}

export type SpotifySearchApiResponse = {
    tracks: {
        items: TrackItem[]
    }
}

export type SpotifyRecommendApiResponse = {
    tracks: TrackItem[]
}

export type AudioFeature = {
    danceability: number,
    energy: number,
    id: string,
    instrumentalness: number,
    key: number,
    liveness: number,
    loudness: number,
    mode: number,
    tempo: number,
    valence: number,
    track_href: string
}

export type SpotifyFeaturesApiResponse = {
    audio_features: AudioFeature[]
}

export type SearchTracksRecord = TrackItem & {
    audioFeatures?: AudioFeature
}

export type SearchTracksResponse = SearchTracksRecord[]

export type RecommendTracksResponse = {
    upperTracks: SearchTracksResponse,
    downerTracks: SearchTracksResponse
}