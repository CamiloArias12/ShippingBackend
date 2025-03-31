import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/MiddlewareAuth';
import { DriverController } from '../controllers/DriverController';

export  class DriverRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private routeController: DriverController;


    constructor( router: Router,middeware:AuthMiddleware, driverController: DriverController) {
        this.router = router ;
        this.routeController = driverController;
        this.authMiddleware = middeware;
    }
    
    public initializeRoutes() {
        /**
         * @swagger
         * /drivers:
         *   get:
         *     summary: Retrieve a list of drivers
         *     tags:
         *       - Drivers
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: A list of drivers
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Driver'
         *       401:
         *         description: Unauthorized
         */
        this.router.get('/drivers', this.authMiddleware.authenticate, (req, res) => this.routeController.findAll(req, res)); 
    }
}