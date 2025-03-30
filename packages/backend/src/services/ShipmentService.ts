import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentRepository } from '../repositories/ShipmentRepository';
import { MailerService } from '../infrastructure/email/email';
import { ShipmentStatusHistoryRepository } from '../repositories/ShipmentStatusHistoryRepository';
import { ShipmentStatus } from '@shipping/shared/enums';
import { AssignShipmentDto, ShipmentUpdateStatusDto } from '@shipping/shared/shipment';
import { Logger } from '../utils/Logger';
import { UserService } from './UserService';
import { DriverService } from './DriverService';
import { RouteService } from './RouteService';

export class ShipmentService {
    private shipmentRepository: ShipmentRepository;
    private shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository;
    private mailerService: MailerService;
    private logger: Logger;
    private userService: UserService;
    private driverService: DriverService;
    private routeService: RouteService;

    constructor(
        shipmentRepository: ShipmentRepository,
        mailerService: MailerService,
        shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
        logger: Logger,
        userService: UserService,
        driverService: DriverService,
        routeService: RouteService
    ) {
        this.logger = logger;
        this.shipmentRepository = shipmentRepository;
        this.mailerService = mailerService;
        this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
        this.userService = userService;
        this.driverService = driverService;
        this.routeService = routeService;
    }

    async create(shipment: Shipment): Promise<Shipment | null> {
        try {
            const newShipment = await this.shipmentRepository.create(shipment);
            if (!newShipment) return null;
            const user = await this.userService.find(shipment.user_id);
            if (!user) {
                throw new Error('Invalid user ID');
            }

            if (newShipment.status) {
                await this.shipmentStatusHistoryRepository.create({
                    shipment_id: newShipment.id!,
                    new_status: newShipment.status,
                    changed_by_user_id: shipment.user_id,
                    created_at: new Date(),
                });
            }
            return newShipment;
        } catch (error) {
            this.logger.error('[ShipmentService](create) Error creating shipment service', error);
            throw error;
        }
    }

    async updateStatus(updateStatusDto: ShipmentUpdateStatusDto): Promise<void> {
        try {
            const currentShipment = await this.shipmentRepository.findById(updateStatusDto.id);
            if (!currentShipment) {
                throw new Error('Shipment not found');
            }
            await this.shipmentRepository.updateStatus(updateStatusDto.id, updateStatusDto.status);

            await this.shipmentStatusHistoryRepository.create({
                shipment_id: updateStatusDto.id,
                previous_status: currentShipment.status,
                new_status: updateStatusDto.status,
                changed_by_user_id: updateStatusDto.userId,
                created_at: new Date(),
            });
        } catch (error) {
            this.logger.error('[ShipmentService](assignDriverAndRoute) Error updating shipment status', error);
            throw error;
        }
    }

    async assignDriverAndRoute(assignDto: AssignShipmentDto): Promise<void> {
        try {
            await this.shipmentRepository.assignDriverAndRoute(assignDto.id, assignDto.driverId, assignDto.routeId);
        } catch (error) {
            this.logger.error('[ShipmentService](assignDriverAndRoute) Error assigning driver and route', error);
            throw error;
        }
    }

    async find(id: number): Promise<Shipment | null> {
        try {
            const data = await this.shipmentRepository.findById(id);
            if (!data) {
                throw new Error('Shipment not found');
            }
            data.user = await this.userService.find(data.user_id);
            if (data.driver_id) {
                data.driver = await this.driverService.find(data.driver_id);
            }
            if (data.route_id) {
                data.route = await this.routeService.find(data.route_id);
            }
            data.shipment_status_history = await this.shipmentStatusHistoryRepository.findByShipmentId(id);
            return data;

        } catch (error) {
            this.logger.error('[ShipmentService](find) Error finding shipment', error);
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        try {
            const shipments = await this.shipmentRepository.findByUserId(userId);
            for (const shipment of shipments) {
                shipment.user = await this.userService.find(userId);
                if (shipment.driver_id) {
                    shipment.driver = await this.driverService.find(shipment.driver_id);
                }
                if (shipment.route_id) {
                    shipment.route = await this.routeService.find(shipment.route_id);
                }
                shipment.shipment_status_history = await this.shipmentStatusHistoryRepository.findByShipmentId(shipment.id!);
            }
            return shipments;
        } catch (error) {
            this.logger.error('[ShipmentService](findByUserId) Error finding shipments by user ID', error);
            throw error;
        }
    }

    async getStatusHistory(shipmentId: number): Promise<any[]> {
        try {
            return await this.shipmentStatusHistoryRepository.findByShipmentId(shipmentId);
        } catch (error) {
            this.logger.error('[ShipmentService](getStatusHistory) Error getting shipment status history', error);
            throw error;
        }
    }

    async getShipmentsWithAdvancedFilters(filters: {
        startDate?: string;
        endDate?: string;
        status?: ShipmentStatus;
        driverId?: number;
        page?: number;
        limit?: number;
    }): Promise<{ shipments: any[]; total: number }> {
        try {
            const parsedFilters = {
                ...filters,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            };

            return this.shipmentRepository.findWithAdvancedFilters(parsedFilters);
        } catch (error) {
            this.logger.error('[ShipmentService](getShipmentsWithAdvancedFilters) Error find shipments', error);
            throw error;
        }
    }

    async getLogisticsPerformanceMetrics(filters: {
        startDate?: string;
        endDate?: string;
    }): Promise<any> {
        try {
            const parsedFilters = {
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            };

            return this.shipmentRepository.getPerformanceMetrics(parsedFilters);
        } catch (error) {
            this.logger.error('[ShipmentService](getLogisticsPerformanceMetrics) Error getting logistics performance metrics service', error);
            throw error;
        }
    }
}