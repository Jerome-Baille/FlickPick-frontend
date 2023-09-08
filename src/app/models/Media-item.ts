export interface ListMediaItems {
    ListId: number;
    MediaItemId: number;
    ListName: string;
}

export interface MediaItem {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title?: string;
    releaseDate?: Date;
    posterPath?: string;
    overview?: string;
    createdAt?: Date;
    updatedAt?: Date;
    genres?: { id: number, name: string }[];
    status?: string;
    runtime?: number;
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
    videos?: {
        results: {
            id: string;
            iso_639_1: string;
            iso_3166_1: string;
            key: string;
            name: string;
            site: string;
            size: number;
            type: string;
        }[]
    };
  ListMediaItems?: {
      [key: string]: ListMediaItems;
  };
}