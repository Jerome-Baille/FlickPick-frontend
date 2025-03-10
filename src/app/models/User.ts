import { List } from './List';
import { Group } from './Group';
import { MediaItem } from './Media-item';

export interface User {
    id?: number;
    username: string;
    email?: string;
    password?: string;
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
    Groups?: Group[];
    Lists?: List[];
    MediaItems?: MediaItem[];
}