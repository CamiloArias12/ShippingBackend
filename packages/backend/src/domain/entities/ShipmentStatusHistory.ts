import { ShipmentStatus } from './Shipment';

export type ShipmentStatusHistory = {
  id?: number;
  shipment_id: number;
  previous_status?: ShipmentStatus;
  new_status: ShipmentStatus;
  changed_by_user_id?: number;
  changed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};