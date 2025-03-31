import { UserRole } from '@shipping/shared/enums';
import { Driver } from 'typeorm';

export class User {
    id?: number;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    driver?: Driver;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}