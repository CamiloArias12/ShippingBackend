import { z } from 'zod';
import { ShipmentStatus } from '../enums';
import { User } from '../user';
import { Driver, Route } from '..';

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentCreateReq:
 *       type: object
 *       properties:
 *         weight:
 *           type: number
 *           description: The weight of the shipment. Must be a positive number.
 *           example: 10.5
 *         dimensions:
 *           type: string
 *           description: The dimensions of the shipment. Cannot be empty.
 *           example: "10x20x30"
 *         product_type:
 *           type: string
 *           description: The type of product being shipped. Cannot be empty.
 *           example: "electronics"
 *         destination:
 *           type: string
 *           description: The destination address of the shipment. Cannot be empty.
 *           example: "123 Main St, Springfield"
 *         location:
 *           type: object
 *           description: The optional geographical location of the shipment.
 *           properties:
 *             lat:
 *               type: number
 *               description: The latitude of the location.
 *               example: 37.7749
 *             lng:
 *               type: number
 *               description: The longitude of the location.
 *               example: -122.4194
 *       required:
 *         - weight
 *         - dimensions
 *         - product_type
 *         - destination
 *       additionalProperties: false
 */
export const ShipmentCreateReq = z.object({
    weight: z.number({ message: "weight.required" }).positive(),
    dimensions: z.string({ message: "dimensions.required" }).nonempty(),
    product_type: z.string({ message: "product_type.required" }).nonempty(),
    destination: z.string({ message: "destination.required" }).nonempty(),
    location: z.object({
        lat: z.number({ message: "latitude.required" }).optional(),
        lng:z.number({ message: "longitude.required" }).optional(),
    }).optional(),
}).strict();

export type ShipmentCreateDto = z.infer<typeof ShipmentCreateReq>;

/**
 * @swagger
 * components:
 *   schemas:
 *     AssignShipmentReq:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the shipment. Cannot be empty.
 *           example: "shipment123"
 *         driverId:
 *           type: number
 *           description: The ID of the driver. Must be a non-negative number.
 *           example: 1
 *         routeId:
 *           type: number
 *           description: The ID of the route. Must be a non-negative number.
 *           example: 2
 *       required:
 *         - id
 *         - driverId
 *         - routeId
 *       additionalProperties: false
 */
export const AssignShipmentReq = z.object({
    id: z.string({ message: "shipment.required" }),
    driverId: z.number({ message: "driver.required" }).nonnegative(),
    routeId: z.number({ message: "route.required" }).nonnegative(),
}).strict();

export type AssignShipmentDto = z.infer<typeof AssignShipmentReq>;

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentUpdateStatusReq:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the shipment. Cannot be empty.
 *           example: "shipment123"
 *         status:
 *           type: string
 *           description: The status of the shipment. Must be a valid ShipmentStatus enum value.
 *           example: "IN_TRANSIT"
 *       required:
 *         - id
 *         - status
 *       additionalProperties: false
 */
export const ShipmentUpdateStatusReq = z.object({
    id: z.string({ message: "shipment.required" }),
    status: z.nativeEnum(ShipmentStatus, { message: "status.required" })
}).strict();

export type ShipmentUpdateStatusDtoReq = z.infer<typeof ShipmentUpdateStatusReq>;

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentUpdateStatusDto:
 *       allOf:
 *         - $ref: '#/components/schemas/ShipmentUpdateStatusReq'
 *         - type: object
 *           properties:
 *             userId:
 *               type: number
 *               description: The ID of the user updating the status. Must be a non-negative number.
 *               example: 1
 *           required:
 *             - userId
 */
export const ShipmentUpdateStatusDto = ShipmentUpdateStatusReq.extend({
    userId: z.number({ message: "user.required" }).nonnegative(),
});

export type ShipmentUpdateStatusDto = z.infer<typeof ShipmentUpdateStatusDto>;

/**
 * @swagger
 * components:
 *   schemas:
 *     Shipment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the shipment.
 *           example: "shipment123"
 *         weight:
 *           type: number
 *           description: The weight of the shipment.
 *           example: 10.5
 *         dimensions:
 *           type: string
 *           description: The dimensions of the shipment.
 *           example: "10x20x30"
 *         user_id:
 *           type: number
 *           description: The ID of the user who created the shipment.
 *           example: 1
 *         driver_id:
 *           type: number
 *           description: The ID of the driver assigned to the shipment.
 *           example: 2
 *         product_type:
 *           type: string
 *           description: The type of product being shipped.
 *           example: "electronics"
 *         destination:
 *           type: string
 *           description: The destination address of the shipment.
 *           example: "123 Main St, Springfield"
 *         latitude:
 *           type: number
 *           description: The latitude of the shipment's location.
 *           example: 37.7749
 *         longitude:
 *           type: number
 *           description: The longitude of the shipment's location.
 *           example: -122.4194
 *         status:
 *           type: string
 *           description: The current status of the shipment.
 *           example: "IN_TRANSIT"
 *         shipment_status_history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShipmentStatusHistory'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         driver:
 *           $ref: '#/components/schemas/Driver'
 *         route:
 *           $ref: '#/components/schemas/Route'
 *         route_id:
 *           type: number
 *           description: The ID of the route assigned to the shipment.
 *           example: 3
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the shipment was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the shipment was last updated.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the shipment was deleted.
 */
export type Shipment = {
    id?: string;
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
    user?: User;
    driver?: Driver;
    route?: Route;
    route_id?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentStatusHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the status history record.
 *           example: "history123"
 *         shipment_id:
 *           type: number
 *           description: The ID of the shipment associated with this status history.
 *           example: 1
 *         previous_status:
 *           type: string
 *           description: The previous status of the shipment.
 *           example: "PENDING"
 *         new_status:
 *           type: string
 *           description: The new status of the shipment.
 *           example: "IN_TRANSIT"
 *         changed_by_user_id:
 *           type: number
 *           description: The ID of the user who changed the status.
 *           example: 1
 *         changed_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the status was changed.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the status history record was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the status history record was last updated.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the status history record was deleted.
 */
export type ShipmentStatusHistory = {
    id?: string;
    shipment_id: number;
    previous_status?: ShipmentStatus;
    new_status: ShipmentStatus;
    changed_by_user_id?: number;
    changed_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}