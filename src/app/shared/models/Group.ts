import { User } from './User';
import { List } from './List';
import { Event } from './Event';

export interface GroupUser {
    uuid: number;
    GroupId: number;
    created_at: string;
    updated_at: string;
}

export interface Group {
    id: number;
    name: string;
    code: string;
    adminIds: number[];
    isAdmin?: boolean;  // Optional boolean to indicate if current user is admin
    Users: User[];
    Lists: List[];
    Events?: Event[];   // Movie night events under this group
    createdAt: string;
    updatedAt: string;
}