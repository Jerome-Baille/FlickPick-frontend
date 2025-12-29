import { User } from './User';
import { Group } from './Group';

export interface ListMediaItem {
    id: number;
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath?: string;
    releaseDate?: string;
    overview?: string;
}

export interface List {
    id?: number;
    name: string;
    description?: string;
    MediaItems?: ListMediaItem[];
    userId?: number;
    groupId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    User?: User;
    Group?: Group;
}