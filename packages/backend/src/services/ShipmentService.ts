import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentRepository } from '../repositories/ShipmentRepository';
import { MailerService } from '../infrastructure/email/email';
import { ShipmentStatusHistoryRepository } from '../repositories/ShipmentStatusHistoryRepository';
import { ShipmentStatus } from '@shipping/shared/enums';
import { AssignShipmentDto, ShipmentUpdateStatusDto } from '@shipping/shared/shipment';
import { Logger } from '../utils/Logger';

export class ShipmentService {
    private shipmentRepository: ShipmentRepository;
    private shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository;
    private mailerService: MailerService;
    private logger: Logger;

    constructor(
        shipmentRepository: ShipmentRepository,
        mailerService: MailerService,
        shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
        logger: Logger
    ) {
        this.logger = logger;
        this.shipmentRepository = shipmentRepository;
        this.mailerService = mailerService;
        this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
    }

    async create(shipment: Shipment): Promise<Shipment | null> {
        try {
            const newShipment = await this.shipmentRepository.create(shipment);
            if (!newShipment) return null;

            if (newShipment.status) {
                await this.shipmentStatusHistoryRepository.create({
                    shipment_id: newShipment.id!,
                    new_status: newShipment.status,
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
            return await this.shipmentRepository.findById(id);
        } catch (error) {
            this.logger.error('[ShipmentService](find) Error finding shipment', error);
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        try {
            return await this.shipmentRepository.findByUserId(userId);
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