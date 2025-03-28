import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { ShipmentAssignmentController } from '../controllers/ShipmentAssignmentController';

export class ShipmentAssignmentRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private shipmentAssignmentController: ShipmentAssignmentController;

    constructor(router: Router, authMiddleware: AuthMiddleware, shipmentAssignmentController: ShipmentAssignmentController) {
        this.router = router;
        this.authMiddleware = authMiddleware;
        this.shipmentAssignmentController = shipmentAssignmentController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        this.router.post(
            '/assignments',
            this.authMiddleware.authenticate,
            (req, res) => this.shipmentAssignmentController.assign(req, res)
        );

        this.router.get(
            '/assignments',
            this.authMiddleware.authenticate,
            (req, res) => this.shipmentAssignmentController.getAssignments(req, res)
        );

        this.router.patch(
            '/assignments/:id/status',
            this.authMiddleware.authenticate,
            (req, res) => this.shipmentAssignmentController.updateStatus(req, res)
        );
    }
}