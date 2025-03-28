import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { RouteController } from '../controllers/RouteController';

export  class UserRoutes {
    private router: Router;
    private authMiddleware: AuthMiddleware;
    private routeController: RouteController;


    constructor( router: Router,middeware:AuthMiddleware, routerController: RouteController) {
        this.router = router ;
        this.routeController = routerController;
        this.authMiddleware = middeware;
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.get('/driver', this.authMiddleware.authenticate, (req, res) => this.routeController.findAll(req, res));
        
    }
}

