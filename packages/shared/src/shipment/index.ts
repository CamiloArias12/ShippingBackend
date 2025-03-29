import { z } from 'zod';
import { ShipmentStatus } from '../enums';

export const ShipmentCreateReq = z.object({
    weight: z.number({ message: "weight.required" }).positive(),
    dimensions: z.string({ message: "dimensions.required" }).nonempty(),
    product_type: z.string({ message: "product_type.required" }).nonempty(),
    destination: z.string({ message: "destination.required" }).nonempty(),
}).strict();

export type ShipmentCreateDto = z.infer<typeof ShipmentCreateReq>;

export const AssignShipmentReq = z.object({
    id: z.number({ message: "shipment.required" }).nonnegative(),
    driverId: z.number({ message: "driver.required" }).nonnegative(),
    routeId: z.number({ message: "route.required" }).nonnegative(),
}).strict();

export type AssignShipmentDto = z.infer<typeof AssignShipmentReq>;


export const ShipmentUpdateStatusReq = z.object({
    id: z.number({ message: "shipment.required" }).nonnegative(),
    status: z.nativeEnum(ShipmentStatus, { message: "status.required" })
}).strict();

export const ShipmentUpdateStatusDto = ShipmentUpdateStatusReq.extend({
    userId: z.number({ message: "user.required" }).nonnegative(),
});

export type ShipmentUpdateStatusDto = z.infer<typeof ShipmentUpdateStatusDto>;

