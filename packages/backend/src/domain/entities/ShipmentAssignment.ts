export enum ShipmentAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type ShipmentAssignment = {
  id?: number;
  shipment_id: number;
  route_id: number;
  driver_id: number;
  status?: ShipmentAssignmentStatus;
  assigned_at?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};