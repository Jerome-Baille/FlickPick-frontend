import { User } from './User';
import { Group } from './Group';

export interface List {
    name: string;
    userId?: number;
    groupId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    User?: User;
    Group?: Group;
}