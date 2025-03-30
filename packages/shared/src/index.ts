import { DriverStatus } from "./enums";

export class Route {
    id?: number;
    name: string;
    origin: string;
    destination: string;
    distance: number;
    estimated_time: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }

export type Driver= {
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
