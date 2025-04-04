import { Request, Response } from 'express';
import { AuthLoginReq } from '@shipping/shared/dist/auth';
import { UserCreateReq } from '@shipping/shared/dist/user/index';
import { UserService } from 'src/services/UserService';
import { Logger } from '../../../utils/Logger';


export class UserController {
    private userService: UserService;
    private logger: Logger;

    constructor(userService: UserService, logger: Logger) {
        this.logger = logger;
        this.userService = userService;
    }
    async create(req: Request, res: Response): Promise<void> {
        const validation = UserCreateReq.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Invalid fields', validation });
            return;
        }

        try {
            const user = await this.userService.create(validation.data);
            res.status(201).json(user);
        } catch (error) {
            this.logger.error('[UserController](create) Error creating user:', error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        const validation= AuthLoginReq.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Invalid fields', validation });
            return;
        }
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            if (!result) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            res.status(200).json(result);
        } catch (error) {
            this.logger.error('[UserController](login) Error logging in user:', error);
            res.status(500).json({ error: 'Failed to login user' });
        }
    }

    async find(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;
            if (!user) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
            const data = await this.userService.find(user.id);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(data);
        } catch (error) {
            this.logger.error('[UserController](find) Error finding user:', error);
            res.status(500).json({ error: 'Failed to find user' });
        }
    }
}