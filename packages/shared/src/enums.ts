export enum DriverStatus {
    AVAILABLE = 'available',
    BUSY = 'busy',
    OFFLINE = 'offline'
}

export enum ShipmentStatus {
    PENDING = "pending",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DRIVER = 'driver'
}