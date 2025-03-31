import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/MiddlewareAuth';
import { RouteController } from '../controllers/RouteController';

export class RouteRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private routeController: RouteController;


    constructor(router: Router, middeware: AuthMiddleware, routerController: RouteController) {
        this.router = router;
        this.routeController = routerController;
        this.authMiddleware = middeware;
    }

    public initializeRoutes() {
        /**
         * @swagger
         * /routes:
         *   get:
         *     summary: Retrieve a list of routes
         *     description: Retrieve all routes from the database. Requires authentication.
         *     tags:
         *       - Routes
         *     responses:
         *       200:
         *         description: A list of routes
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Route'
         *       401:
         *         description: Unauthorized
         *       500:
         *         description: Internal server error
         */
        this.router.get('/routes', this.authMiddleware.authenticate, async (req, res) =>
            await this.routeController.findAll(req, res));
    }
}