import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../utils/Jwt';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization token required' });
        return;
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = this.jwtService.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}