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
        this.router.post('/shipments', authMiddleware.authenticate, (req, res) =>
            this.shipmentController.create(req, res)
        );
    }
}