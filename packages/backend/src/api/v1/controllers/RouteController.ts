import { Request, Response } from 'express';
import { RouteService } from 'src/services/RouteService';


export class RouteController {
    private routeService: RouteService;

    constructor(routeService: RouteService) {
        this.routeService = routeService;
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;
            if (!user) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
            const data = await this.routeService.findAll();
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error finding user:', error);
            res.status(500).json({ error: 'Failed to find user' });
        }
    }
}