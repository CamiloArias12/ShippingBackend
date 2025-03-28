import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';

export  class UserRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private userController: UserController;


    constructor( router: Router,middeware:AuthMiddleware, userController: UserController) {
        this.router = router ;
        this.userController = userController;
        this.authMiddleware = middeware;
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post('/create', (req, res) => this.userController.register(req, res));
        this.router.post('/login', (req, res) => this.userController.login(req, res));
        
    }
}

