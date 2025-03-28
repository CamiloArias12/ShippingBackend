import { Request, Response } from 'express';
import { ShipmentService } from '../../../services/ShipmentService';

export class ShipmentController {
    private shipmentService: ShipmentService;

    constructor(shipmentService: ShipmentService) {
        this.shipmentService = shipmentService;
    }

    async create(req: Request, res: Response): Promise<void> {

        /*
        const validation = ShipmentReq.safeParse(req.body);
        if (!validation.success) {
          res.status(400).json({ error: 'Invalid data', validation });
          return;
        }
        */
        const user = req.user;
        if (!user) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const result = await this.shipmentService.create({ user_id: user.id, ...req.body });
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating shipment:', error);
            res.status(500).json({ error: 'Failed to register shipment' });
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        const { id, status } = req.body;
        try {
            await this.shipmentService.updateStatus(Number(id), status, req.user?.id);
            res.status(200).json({ message: 'Status updated' });
        } catch (error) {
            console.error('Error updating shipment status:', error);
            res.status(500).json({ error: 'Failed to update shipment status' });
        }
    }

    async assignDriverAndRoute(req: Request, res: Response): Promise<void> {
        const { id, driverId, routeId } = req.body;

        try {
            await this.shipmentService.assignDriverAndRoute(Number(id), Number(driverId), Number(routeId));
            res.status(200).json({ message: 'Driver and route assigned' });
        } catch (error) {
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
            console.error('Error finding shipments:', error);
            res.status(500).json({ error: 'Failed to find shipments' });
        }
    }

    async find(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const shipment = await this.shipmentService.find(Number(id));
            if (!shipment) {
                res.status(404).json({ error: 'Shipment not found' });
                return;
            }
            res.status(200).json(shipment);
        } catch (error) {
            console.error('Error finding shipment:', error);
            res.status(500).json({ error: 'Failed to find shipment' });
        }
    }

    async getStatusHistory(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const history = await this.shipmentService.getStatusHistory(Number(id));
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get status history' });
        }
    }
}