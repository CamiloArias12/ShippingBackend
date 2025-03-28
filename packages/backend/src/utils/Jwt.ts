import jwt from 'jsonwebtoken';
import { config } from '../config';

export class JwtService {
  private secret = config.jwt.secret || 'yoursecret';
  private expiresIn = config.jwt.expiresIn || '1h';

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}