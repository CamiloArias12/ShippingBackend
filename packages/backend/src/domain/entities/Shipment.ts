import { ShipmentStatus } from '@shipping/shared/enums';
import { ShipmentStatusHistory } from './ShipmentStatusHistory';

export class Shipment {
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
    shipment_status_history?: ShipmentStatusHistory[];
    route_id?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
