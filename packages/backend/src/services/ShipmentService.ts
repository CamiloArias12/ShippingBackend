import mysql from 'mysql2/promise';
import { Shipment, ShipmentStatus } from '../domain/entities/Shipment';
import { ShipmentRepository } from '../repositories/ShipmentRepository';
import { MailerService } from '../infrastructure/email/email';
import { ShipmentStatusHistoryRepository } from '../repositories/ShipmentStatusHistoryRepository';

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

    async updateStatus(id: number, status: ShipmentStatus, userId?: number): Promise<void> {
        const currentShipment = await this.shipmentRepository.findById(id);
        if (!currentShipment) {
            throw new Error('Shipment not found');
        }
        console.log('Current shipment:', currentShipment);
        await this.shipmentRepository.updateStatus(id, status);
        
        await this.shipmentStatusHistoryRepository.create({
            shipment_id: id,
            previous_status: currentShipment.status,
            new_status: status,
            changed_by_user_id: userId,
            created_at: new Date(),
        });
    }

    async assignDriverAndRoute(id: number, driverId: number, routeId: number): Promise<void> {
        await this.shipmentRepository.assignDriverAndRoute(id, driverId, routeId);
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