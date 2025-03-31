import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */
export class UserRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private userController: UserController;

    constructor(router: Router, middleware: AuthMiddleware, userController: UserController) {
        this.router = router;
        this.userController = userController;
        this.authMiddleware = middleware;
    }

    initializeRoutes() {
        /**
         * @swagger
         * /user:
         *   post:
         *     summary: Create a new user
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/UserCreateReq'
         *     responses:
         *       201:
         *         description: User created successfully
         *       400:
         *         description: Invalid fields
         *       500:
         *         description: Failed to register user
         */
        this.router.post('/user', (req: Request, res: Response) => this.userController.create(req, res));

        /**
         * @swagger
         * /user/login:
         *   post:
         *     summary: Login a user
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/AuthLoginReq'
         *     responses:
         *       200:
         *         description: Login successful
         *       400:
         *         description: Invalid fields
         *       401:
         *         description: Invalid credentials
         *       500:
         *         description: Failed to login user
         */
        this.router.post('/user/login', (req: Request, res: Response) => this.userController.login(req, res));

        /**
         * @swagger
         * /user:
         *   get:
         *     summary: Get user details
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: User details retrieved successfully
         *       403:
         *         description: Unauthorized
         *       404:
         *         description: User not found
         *       500:
         *         description: Failed to find user
         */
        this.router.get('/user', this.authMiddleware.authenticate, (req: Request, res: Response) => this.userController.find(req, res));
    }
}
