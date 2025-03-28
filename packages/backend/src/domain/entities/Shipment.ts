export enum ShipmentStatus {
PENDING = "Pending",
IN_TRANSIT = "In transit",
DELIVERED = "Delivered",
}

export type Shipment = {
  id?: number;
  weight: number;
  dimensions: string;
  product_type: string;
  destination: string;
  status?: ShipmentStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};
