import { User } from './User';
import { Group } from './Group';

export interface List {
    id?: number;
    name: string;
    description?: string;
    MediaItems?: any[];
    userId?: number;
    groupId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    User?: User;
    Group?: Group;
}