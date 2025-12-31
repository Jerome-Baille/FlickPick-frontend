export interface UserList {
    id: number;
    name: string;
    description?: string;
}

export interface UserGroup {
    id: number;
    name: string;
    code?: string;
}

export interface User {
    id?: number;
    username: string;
    uuid?: string;
    email?: string;
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
    Lists?: UserList[];
    Groups?: UserGroup[];
}