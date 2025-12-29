import { User } from './User';
import { List } from './List';

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
    createdAt: string;
    updatedAt: string;
}