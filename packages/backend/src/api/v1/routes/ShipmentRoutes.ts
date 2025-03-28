import { Router } from 'express';
import mysql from 'mysql2/promise';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { ShipmentController } from '../controllers/ShipmentController';

export class ShipmentRoutes {
    private router: Router;
    private shipmentController: ShipmentController;

    constructor(router: Router, authMiddleware: AuthMiddleware, shuipmentController: ShipmentController) {
        this.router = router;
        this.shipmentController = shuipmentController
        this.initializeRoutes(authMiddleware);
    }

    private initializeRoutes(authMiddleware: AuthMiddleware) {
        this.router.post('/shipment', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.create(req, res)
        );
        this.router.put('/shipment/status', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.updateStatus(req, res)
        );
        this.router.put('/shipment/assign', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.assignDriverAndRoute(req, res)
        );
        this.router.get('/shipment', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.findByUserId(req, res)
        );
        this.router.get('/shipment/:id', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.find(req, res)
        );
        this.router.get('/shipment/:id/status-history', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.getStatusHistory(req, res)
        );
    }
}