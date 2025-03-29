import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../utils/Jwt';
import { Logger } from '../../utils/Logger';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  private jwtService: JwtService;
  private looger: Logger;

  constructor(jwtService: JwtService, logger: Logger) {
    this.jwtService = jwtService;
    this.looger = logger;
  }

  public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        this.looger.error('Invalid token:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      this.looger.error('[AuthMiddleware](authenticate) Error in authentication middleware:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}