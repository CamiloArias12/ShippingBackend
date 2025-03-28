
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DRIVER = 'driver'
}

export type User = {
    id?: number;
    email: string;
    password: string;
    role?: UserRole;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}