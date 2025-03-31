import { ShipmentStatus } from '@shipping/shared/enums';
import { ShipmentStatusHistory } from './ShipmentStatusHistory';
import { User } from './User';
import { Route } from './Route';
import { Driver } from './Driver';

export class Shipment {
    id?: string;
    weight: number;
    dimensions: string;
    user_id: number;
    user?: User;
    driver_id?: number;
    driver?: Driver;
    product_type: string;
    destination: string;
    latitude?: number;
    longitude?: number;
    status?: ShipmentStatus;
    shipment_status_history?: ShipmentStatusHistory[];
    route_id?: number;
    route?: Route;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
