import { Request, Response } from 'express';
import { UserService } from 'src/services/UserService';


export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Failed to register user' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
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