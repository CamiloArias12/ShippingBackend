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
import { v4 as uuidv4 } from 'uuid';
import { SocketIOService } from '../infrastructure/socketio/socketio';
import { RedisService } from 'src/infrastructure/cache/redis';

export class ShipmentService {
    private shipmentRepository: ShipmentRepository;
    private shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository;
    private mailerService: MailerService;
    private logger: Logger;
    private userService: UserService;
    private driverService: DriverService;
    private routeService: RouteService;
    private socketIOService: SocketIOService;
    private redisService: RedisService;

    constructor(
        shipmentRepository: ShipmentRepository,
        mailerService: MailerService,
        shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
        logger: Logger,
        userService: UserService,
        driverService: DriverService,
        routeService: RouteService,
        socketIOService: SocketIOService,
        redisService: RedisService
    ) {
        this.logger = logger;
        this.shipmentRepository = shipmentRepository;
        this.mailerService = mailerService;
        this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
        this.userService = userService;
        this.driverService = driverService;
        this.routeService = routeService;
        this.socketIOService = socketIOService;
        this.redisService = redisService;
    }

    async create(shipment: Shipment): Promise<Shipment | null> {
        try {
            shipment.id = uuidv4();
            const newShipment = await this.shipmentRepository.create(shipment);
            if (!newShipment) return null;
            const user = await this.userService.find(shipment.user_id);
            if (!user) {
                throw new Error('Invalid user ID');
            }
            if (newShipment.status) {
                await this.shipmentStatusHistoryRepository.create({
                    shipment_id: shipment.id!,
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
            const cacheKey = `shipment:${updateStatusDto.id}`;
            const cachedData = await this.redisService.get(cacheKey);

            if (cachedData) {
                this.logger.log('info', `Cache hit for shipment ID: `);
               await  this.redisService.delete(cacheKey);
            }
            const data = await this.find(updateStatusDto.id);
            if (!data) {
                throw new Error('Shipment not found');
            }
            
            this.socketIOService.emit(`shipment:${updateStatusDto.id}`, data);

            this.logger.log('info', `Shipment status updated and event emitted for shipment ID: ${updateStatusDto.id}`);
        } catch (error) {
            this.logger.error('[ShipmentService](updateStatus) Error updating shipment status', error);
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

    async find(id: string): Promise<Shipment | null> {
        try {
            const cacheKey = `shipment:${id}`;
            const cachedData = await this.redisService.get(cacheKey);

            if (cachedData) {
                this.logger.log('info', `Cache hit for shipment ID: ${id}`);
                return JSON.parse(cachedData);
            }

            const data = await this.shipmentRepository.findById(id);
            if (!data) {
                throw new Error('Shipment not found');
            }
            data.shipment_status_history = await this.shipmentStatusHistoryRepository.findByShipmentId(data.id!);
            if (data.user_id) {
                data.user = await this.userService.find(data.user_id);
            }
            if (data.driver_id) {
                data.driver = await this.driverService.find(data.driver_id);
            }
            if (data.route_id) {
                data.route = await this.routeService.find(data.route_id);
            }

            await this.redisService.set(cacheKey, JSON.stringify(data));

            return data;
        } catch (error) {
            this.logger.error('[ShipmentService](find) Error finding shipment', error);
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        try {
            const data = await this.shipmentRepository.findByUserId(userId);
            for (const shipment of data) {
                shipment.shipment_status_history = await this.shipmentStatusHistoryRepository.findByShipmentId(shipment.id!);
                shipment.user = await this.userService.find(shipment.user_id);
                if (shipment.driver_id) {
                    shipment.driver = await this.driverService.find(shipment.driver_id);
                }
                if (shipment.route_id) {
                    shipment.route = await this.routeService.find(shipment.route_id);
                }
            }
            return data;
        } catch (error) {
            this.logger.error('[ShipmentService](findByUserId) Error finding shipments by user ID', error);
            throw error;
        }
    }

    async getStatusHistory(shipmentId: string): Promise<any[]> {
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
            const cacheKey = `shipments:${JSON.stringify(filters)}`;

            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                this.logger.log('info', `Cache hit for key: ${cacheKey}`);
                return JSON.parse(cachedData);
            }
            const parsedFilters = {
                ...filters,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            };

            await this.redisService.set(cacheKey, JSON.stringify(parsedFilters));

            return this.shipmentRepository.findWithAdvancedFilters(parsedFilters);
        } catch (error) {
            this.logger.error('[ShipmentService](getShipmentsWithAdvancedFilters) Error find shipments', error);
            throw error;
        }
    }

    async getShipmentsWithMetrics(filters: {
        startDate?: Date;
        endDate?: Date;
        status?: ShipmentStatus;
        driverId?: number;
        page?: number;
        limit?: number;
    }): Promise<any> {
        try {
            const cacheKey = `shipments:metrics:${JSON.stringify(filters)}`;
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                this.logger.log('info', `Cache hit for key: ${cacheKey}`);
                return JSON.parse(cachedData);
            }
            const data= this.shipmentRepository.getShipmentsCountAndGroupedByDate(filters);
            await this.redisService.set(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            this.logger.error('[ShipmentService](getShipmentsWithMetrics) Error fetching shipments with metrics:', error);
            throw error;
        }
    }

    async getLogisticsPerformanceMetrics(filter:any): Promise<any> {
        try {
            return this.shipmentRepository.getFilteredShipments(filter);
        } catch (error) {
            this.logger.error('[ShipmentService](getLogisticsPerformanceMetrics) Error getting logistics performance metrics service', error);
            throw error;
        }
    }

    async findAll(): Promise<Shipment[]> {
        try {
            const data = await this.shipmentRepository.findAll();
            for (const shipment of data) {

                shipment.shipment_status_history = await this.shipmentStatusHistoryRepository.findByShipmentId(shipment.id!);
                shipment.user = await this.userService.find(shipment.user_id);
                if (shipment.driver_id) {
                    shipment.driver = await this.driverService.find(shipment.driver_id);
                }
                if (shipment.route_id) {
                    shipment.route = await this.routeService.find(shipment.route_id);
                }
            }
            return data;
        } catch (error) {
            this.logger.error('[ShipmentService](findAll) Error finding all shipments', error);
            throw error;
        }
    }
}