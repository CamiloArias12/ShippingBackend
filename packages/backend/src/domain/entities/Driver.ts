export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export type Driver = {
  id?: number;
  user_id: number;
  license: string;
  vehicle_type: string;
  vehicle_capacity: number;
  status?: DriverStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};