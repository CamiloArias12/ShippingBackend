import { DriverStatus } from '@shipping/shared/enums';
import { User } from './User';

export class Driver {
  id?: number;
  user_id: number;
  user: User
  license: string;
  vehicle_type: string;
  vehicle_capacity: number;
  status?: DriverStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}