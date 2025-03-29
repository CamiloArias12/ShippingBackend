import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { ShipmentController } from '../controllers/ShipmentController';

export class ShipmentRoutes {
    private router: Router;
    private shipmentController: ShipmentController;
    private authMiddleware: AuthMiddleware;

    constructor(router: Router, authMiddleware: AuthMiddleware, shuipmentController: ShipmentController) {
        this.router = router;
        this.authMiddleware = authMiddleware;
        this.shipmentController = shuipmentController
    }

     initializeRoutes() {
        this.router.post('/shipment', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.create(req, res)
        );
        this.router.put('/shipment/status', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.updateStatus(req, res)
        );
        this.router.put('/shipment/assign', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.assignDriverAndRoute(req, res)
        );
        this.router.get('/shipment', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.findByUserId(req, res)
        );
        this.router.get('/shipment/:id', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.find(req, res)
        );
        this.router.get('/shipment/:id/status-history', this.authMiddleware.authenticate, (req, res) =>
            this.shipmentController.getStatusHistory(req, res)
        );
    }
}