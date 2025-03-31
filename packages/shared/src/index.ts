import { DriverStatus } from "./enums";
import { User } from "./user";

/**
 * @swagger
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Unique identifier for the route.
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the route.
 *           example: "Route A"
 *         origin:
 *           type: string
 *           description: Starting point of the route.
 *           example: "City A"
 *         destination:
 *           type: string
 *           description: Ending point of the route.
 *           example: "City B"
 *         distance:
 *           type: number
 *           format: float
 *           description: Distance of the route in kilometers.
 *           example: 120.5
 *         estimated_time:
 *           type: number
 *           format: float
 *           description: Estimated time to complete the route in hours.
 *           example: 2.5
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the route record was created.
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the route record was last updated.
 *           example: "2023-01-02T12:00:00Z"
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the route record was deleted, if applicable.
 *           example: "2023-01-03T12:00:00Z"
 *       required:
 *         - name
 *         - origin
 *         - destination
 *         - distance
 *         - estimated_time
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Unique identifier for the driver.
 *           example: 1
 *         user_id:
 *           type: integer
 *           format: int32
 *           description: Unique identifier for the associated user.
 *           example: 42
 *         license:
 *           type: string
 *           description: Driver's license number.
 *           example: "ABC123456"
 *         vehicle_type:
 *           type: string
 *           description: Type of vehicle the driver operates.
 *           example: "Truck"
 *         vehicle_capacity:
 *           type: integer
 *           format: int32
 *           description: Capacity of the vehicle in terms of load or passengers.
 *           example: 4
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: Associated user details.
 *         status:
 *           $ref: '#/components/schemas/DriverStatus'
 *           description: Current status of the driver.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the driver record was created.
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the driver record was last updated.
 *           example: "2023-01-02T12:00:00Z"
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the driver record was deleted, if applicable.
 *           example: "2023-01-03T12:00:00Z"
 *       required:
 *         - user_id
 *         - license
 *         - vehicle_type
 *         - vehicle_capacity
 */
export type Driver= {
  id?: number;
  user_id: number;
  license: string;
  vehicle_type: string;
  vehicle_capacity: number;
  user?: User;
  status?: DriverStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
