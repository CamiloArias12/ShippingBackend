
/**
 * @swagger
 * components:
 *   schemas:
 *     DriverStatus:
 *       type: string
 *       enum:
 *         - available
 *         - busy
 *         - offline
 *       description: Represents the status of a driver.
 */
export enum DriverStatus {
    AVAILABLE = 'available',
    BUSY = 'busy',
    OFFLINE = 'offline'
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentStatus:
 *       type: string
 *       enum:
 *         - pending
 *         - in_transit
 *         - delivered
 *         - cancelled
 *       description: Represents the status of a shipment.
 */
export enum ShipmentStatus {
    PENDING = "pending",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum:
 *         - admin
 *         - user
 *         - driver
 *       description: Represents the role of a user in the system.
 */
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DRIVER = 'driver'
}