export interface User {
    id?: number;
    username: string;
    uuid?: string;
    email?: string;
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
    Lists?: any[];
    Groups?: any[];
    Favorites?: {
        id: number;
        mediaItemId: number;
        uuid: number;
        createdAt: string;
        updatedAt: string;
        MediaItem: {
            id: number;
            title: string;
            mediaType: string;
            tmdbId: number;
        };
    }[];
}