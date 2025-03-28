import { Request, Response } from 'express';
import { AuthLoginReq } from '@shipping/shared/dist/auth';
import { UserReq } from '@shipping/shared/dist/user/user';
import { UserService } from 'src/services/UserService';


export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(req: Request, res: Response): Promise<void> {
        const validation = UserReq.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Invalid fields', validation });
            return;
        }

        try {
            const user = await this.userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.error('Error registering user:', error);
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
            res.status(500).json({ error: 'Failed to login user' });
        }
    }
}