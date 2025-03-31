import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../../middlewares/MiddlewareAuth';
import { ShipmentController } from '../controllers/ShipmentController';

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Shipment management and operations
 */
export class ShipmentRoutes {
    private router: Router;
    private shipmentController: ShipmentController;
    private authMiddleware: AuthMiddleware;

    constructor(router: Router, authMiddleware: AuthMiddleware, shipmentController: ShipmentController) {
        this.router = router;
        this.authMiddleware = authMiddleware;
        this.shipmentController = shipmentController;
    }

    initializeRoutes() {
        /**
         * @swagger
         * /shipments:
         *   post:
         *     summary: Create a new shipment
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ShipmentCreateReq'
         *     responses:
         *       201:
         *         description: Shipment created successfully
         *       400:
         *         description: Invalid data
         *       403:
         *         description: Unauthorized
         *       500:
         *         description: Failed to register shipment
         */
        this.router.post('/shipments', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.create(req, res)
        );

        /**
         * @swagger
         * /shipments/status:
         *   put:
         *     summary: Update shipment status
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ShipmentUpdateStatusReq'
         *     responses:
         *       200:
         *         description: Status updated successfully
         *       400:
         *         description: Invalid data
         *       403:
         *         description: Unauthorized
         *       500:
         *         description: Failed to update shipment status
         */
        this.router.put('/shipments/status', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.updateStatus(req, res)
        );

        /**
         * @swagger
         * /shipments/assign:
         *   put:
         *     summary: Assign driver and route to a shipment
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/AssignShipmentReq'
         *     responses:
         *       200:
         *         description: Driver and route assigned successfully
         *       400:
         *         description: Invalid data
         *       500:
         *         description: Failed to assign driver and route
         */
        this.router.put('/shipments/assign', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.assignDriverAndRoute(req, res)
        );

        /**
         * @swagger
         * /shipments:
         *   get:
         *     summary: Get shipments by user ID
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of shipments
         *       403:
         *         description: Unauthorized
         *       500:
         *         description: Failed to find shipments
         */
        this.router.get('/shipments', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.findByUserId(req, res)
        );

        /**
         * @swagger
         * /shipments/{id}:
         *   get:
         *     summary: Get a shipment by ID
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Shipment ID
         *     responses:
         *       200:
         *         description: Shipment details
         *       400:
         *         description: Invalid shipment ID
         *       404:
         *         description: Shipment not found
         *       500:
         *         description: Failed to find shipment
         */
        this.router.get('/shipments/:id', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.find(req, res)
        );

        /**
         * @swagger
         * /shipments/all/users:
         *   get:
         *     summary: Get all shipments (Admin only)
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of all shipments
         *       403:
         *         description: Unauthorized
         *       500:
         *         description: Failed to find shipments
         */
        this.router.get('/shipments/all/users', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.findAll(req, res)
        );

        /**
         * @swagger
         * /shipments/{id}/status-history:
         *   get:
         *     summary: Get status history of a shipment
         *     tags: [Shipments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Shipment ID
         *     responses:
         *       200:
         *         description: Status history of the shipment
         *       500:
         *         description: Failed to get status history
         */
        this.router.get('/shipments/:id/status-history', this.authMiddleware.authenticate, (req: Request, res: Response) =>
            this.shipmentController.getStatusHistory(req, res)
        );

        /**
         * @swagger
         * /shipments/filters:
         *   get:
         *     summary: Get shipments with advanced filters
         *     tags: [Shipments]
         *     parameters:
         *       - in: query
         *         name: startDate
         *         schema:
         *           type: string
         *           format: date-time
         *         description: Start date filter
         *       - in: query
         *         name: endDate
         *         schema:
         *           type: string
         *           format: date-time
         *         description: End date filter
         *       - in: query
         *         name: status
         *         schema:
         *           type: string
         *         description: Shipment status filter
         *       - in: query
         *         name: driverId
         *         schema:
         *           type: integer
         *         description: Driver ID filter
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *         description: Page number for pagination
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *         description: Number of items per page
         *     responses:
         *       200:
         *         description: Filtered shipments
         *       500:
         *         description: Failed to fetch shipments with advanced filters
         */
        this.router.get('/shipments/filters/data', (req: Request, res: Response) =>
            this.shipmentController.findWithAdvancedFilters(req, res)
        );

        this.router.get('/shipments/metrics/data', (req, res) =>
            this.shipmentController.getShipmentsWithMetrics(req, res)
        );
    }
}