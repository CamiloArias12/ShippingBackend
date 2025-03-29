import { UserRole } from '@shipping/shared/enums';

export class User {

    id?: number;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
    
}