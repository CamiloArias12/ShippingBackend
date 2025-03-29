import { DriverStatus } from '@shipping/shared/enums';

export class Driver {

  id?: number;
  user_id: number;
  license: string;
  vehicle_type: string;
  vehicle_capacity: number;
  status?: DriverStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}