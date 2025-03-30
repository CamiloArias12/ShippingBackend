import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';

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
        this.router.post('/user', (req, res) => this.userController.create(req, res));
        this.router.post('/user/login', (req, res) => this.userController.login(req, res));
        this.router.get('/user', this.authMiddleware.authenticate, (req, res) => this.userController.find(req, res));
    }
}

