import { Request, Response } from 'express';
import { ShipmentService } from '../../../services/ShipmentService';
import { ShipmentCreateReq,ShipmentUpdateStatusReq,AssignShipmentReq } from '@shipping/shared/dist/shipment/index';
import { Logger } from '../../../utils/Logger';
import { ShipmentStatus, UserRole } from '@shipping/shared/dist/enums';


export class ShipmentController {
    private shipmentService: ShipmentService;
    private logger: Logger;

    constructor(shipmentService: ShipmentService,logger: Logger) {
        this.logger = logger;
        this.shipmentService = shipmentService;
    }

    async create(req: Request, res: Response): Promise<void> {

        const validation =ShipmentCreateReq.safeParse(req.body);
        if (!validation.success) {
          res.status(400).json({ error: 'Invalid data', validation });
          return;
        }
        
        const user = req.user;
        if (!user) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const result = await this.shipmentService.create({ user_id: user.id, ...validation.data });
            res.status(201).json(result);
        } catch (error) {
            this.logger.error('[ShipmentController](create) Error creating shipment:', error);
            res.status(500).json({ error: 'Failed to register shipment' });
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        const user = req.user;

        if (!user || user.role !== UserRole.ADMIN) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const validation = ShipmentUpdateStatusReq.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Invalid data', validation });
            return;
        }

        try {
            await this.shipmentService.updateStatus({...validation.data, userId: req.user?.id });
            res.status(200).json({ message: 'Status updated' });
        } catch (error) {
            this.logger.error('[ShipmentController](create) Error updating shipment status:', error);
            res.status(500).json({ error: 'Failed to update shipment status' });
        }
    }

    async assignDriverAndRoute(req: Request, res: Response): Promise<void> {
        const  validation =AssignShipmentReq.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Invalid data', validation });
            return;
        }
        try {
            await this.shipmentService.assignDriverAndRoute(validation.data);
            res.status(200).json({ message: 'Driver and route assigned' });
        } catch (error) {
            this.logger.error('[ShipmentController](assignDriverAndRoute) Error assigning driver and route:', error);
            res.status(500).json({ error: 'Failed to assign driver and route' });
        }
    }

    async findByUserId(req: Request, res: Response): Promise<void> {
        const { user } = req;
        if (!user) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const shipments = await this.shipmentService.findByUserId(user.id);
            res.status(200).json(shipments);
        } catch (error) {
            this.logger.error('[ShipmentController](findByUserId) Error finding shipments by user ID:', error);
            res.status(500).json({ error: 'Failed to find shipments' });
        }
    }

    async find(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'Invalid shipment id' });
            return;
        }
        try {
            const shipment = await this.shipmentService.find(id);
            if (!shipment) {
                res.status(404).json({ error: 'Shipment not found' });
                return;
            }
            res.status(200).json(shipment);
        } catch (error) {
            this.logger.error('[ShipmentController](find) Error finding shipment:', error);
            res.status(500).json({ error: 'Failed to find shipment' });
        }
    }

    async findAll(req: Request, res: Response): Promise<void> {
        const { user } = req;

        if (!user || user.role !== UserRole.ADMIN) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const shipments = await this.shipmentService.findAll();
            res.status(200).json(shipments);
        } catch (error) {
            this.logger.error('[ShipmentController](findAll) Error finding all shipments:', error);
            res.status(500).json({ error: 'Failed to find shipments' });
        }
    }

    async getStatusHistory(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const history = await this.shipmentService.getStatusHistory(id);
            res.status(200).json(history);
        } catch (error) {
            this.logger.error('[ShipmentController](find) Error getting shipment status history:', error);
            res.status(500).json({ error: 'Failed to get status history' });
        }
    }

    async findWithAdvancedFilters(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                startDate: req.query.startDate ? new Date(req.query.startDate as string).toISOString() : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string).toISOString() : undefined,
                status: req.query.status as ShipmentStatus,
                driverId: req.query.driverId ? parseInt(req.query.driverId as string, 10) : undefined,
                page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            };

            const result = await this.shipmentService.getShipmentsWithAdvancedFilters(filters);
            res.status(200).json(result);
        } catch (error) {
            this.logger.error('[ShipmentController](findWithAdvancedFilters) Error:', error);
            res.status(500).json({ error: 'Failed to fetch shipments with advanced filters' });
        }
    }

    async getShipmentsWithMetrics(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                status: req.query.status as ShipmentStatus,
                driverId: req.query.driverId ? parseInt(req.query.driverId as string, 10) : undefined,
                page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            };

            const result = await this.shipmentService.getShipmentsWithMetrics(filters);
            res.status(200).json(result);
        } catch (error) {
            this.logger.error('[ShipmentController](getShipmentsWithMetrics) Error:', error);
            res.status(500).json({ error: 'Failed to fetch shipments with metrics' });
        }
    }
}