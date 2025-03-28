import { Request, Response } from 'express';
import { AuthLoginReq } from '@shipping/shared/dist/auth';
import { UserReq } from '@shipping/shared/dist/user/user';
import { DriverService } from 'src/services/DriverService';


export class UserController {
    private driverService: DriverService;

    constructor(driverService: DriverService) {
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
            console.error('Error finding user:', error);
            res.status(500).json({ error: 'Failed to find user' });
        }
    }
}