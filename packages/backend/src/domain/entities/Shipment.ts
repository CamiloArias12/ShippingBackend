export enum ShipmentStatus {
    PENDING = "Pending",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "Cancelled",
}

export type Shipment = {
    id?: number;
    weight: number;
    dimensions: string;
    user_id: number;
    driver_id?: number;
    product_type: string;
    destination: string;
    latitude?: number;
    longitude?: number;
    status?: ShipmentStatus;
    route_id?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
};
