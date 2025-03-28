import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentRepository } from '../repositories/ShipmentRepository';
import { MailerService } from '../infrastructure/email/email';
import { ShipmentStatusHistoryRepository } from '../repositories/ShipmentStatusHistoryRepository';
import { ShipmentStatus } from '@shipping/shared/enums';
import { AssignShipmentDto, ShipmentUpdateStatusDto } from '@shipping/shared/shipment';

export class ShipmentService {
    private shipmentRepository: ShipmentRepository;
    private shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository;
    private mailerService: MailerService;

    constructor(
        shipmentRepository: ShipmentRepository, 
        mailerService: MailerService,
        shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository
    ) {
        this.shipmentRepository = shipmentRepository;
        this.mailerService = mailerService;
        this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
    }

    async create(shipment: Shipment): Promise<Shipment | null> {
        const newShipment = await this.shipmentRepository.create(shipment);
        if (!newShipment) return null;
        
        if (newShipment.status) {
            await this.shipmentStatusHistoryRepository.create({
                shipment_id: newShipment.id!,
                new_status: newShipment.status,
            });
        }
        
        return newShipment;
    }

    async updateStatus(upateStatusDto:ShipmentUpdateStatusDto): Promise<void> {
        const currentShipment = await this.shipmentRepository.findById(upateStatusDto.id);
        if (!currentShipment) {
            throw new Error('Shipment not found');
        }
        await this.shipmentRepository.updateStatus(upateStatusDto.id, upateStatusDto.status);
        
        await this.shipmentStatusHistoryRepository.create({
            shipment_id: upateStatusDto.id,
            previous_status: currentShipment.status,
            new_status: upateStatusDto.status,
            changed_by_user_id: upateStatusDto.userId,
            created_at: new Date(),
        });
    }

    async assignDriverAndRoute(assignDto:AssignShipmentDto): Promise<void> {
        await this.shipmentRepository.assignDriverAndRoute(assignDto.id, assignDto.driverId, assignDto.routeId);
    }

    async find(id: number): Promise<Shipment | null> {
        return await this.shipmentRepository.findById(id);
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        return await this.shipmentRepository.findByUserId(userId);
    }
    
    async getStatusHistory(shipmentId: number): Promise<any[]> {
        return await this.shipmentStatusHistoryRepository.findByShipmentId(shipmentId);
    }

    async getShipmentsWithAdvancedFilters(filters: {
        startDate?: string;
        endDate?: string;
        status?: ShipmentStatus;
        driverId?: number;
        page?: number;
        limit?: number;
    }): Promise<{ shipments: any[]; total: number; }> {
        const parsedFilters = {
            ...filters,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        };

        return this.shipmentRepository.findWithAdvancedFilters(parsedFilters);
    }

    async getLogisticsPerformanceMetrics(filters: {
        startDate?: string;
        endDate?: string;
    }): Promise<any> {
        const parsedFilters = {
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        };

        return this.shipmentRepository.getPerformanceMetrics(parsedFilters);
    }
}