import { Request, Response } from 'express';
import { DriverService } from 'src/services/DriverService';
import { Logger } from '../../../utils/Logger';


export class UserController {
    private driverService: DriverService;
    private logger:Logger

    constructor(driverService: DriverService, logger: Logger) {
        this.logger = logger;
        this.driverService = driverService;
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;
            if (!user) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
            const data = await this.driverService.findAll();
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(data);
        } catch (error) {
            this.logger.error('Error finding user:', error);
            res.status(500).json({ error: 'Failed to find user' });
        }
    }
}