export interface Group {
    id?: number;
    name: string;
    isAdmin?: boolean;
    description?: string;
    userIds?: number[];
    listName?: string;
    Users?: any[];
    Lists?: any[];
    MediaItems?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}